import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
import { User } from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get user to check role and estate
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If user doesn't belong to an estate, they can't see any service charges
        if (!user.estate) {
            return NextResponse.json([]);
        }

        let serviceCharges;
        if (user.role === 'admin' || user.role === 'estate_admin') {
            // Admins and estate admins can see all service charges in their estate
            serviceCharges = await ServiceCharge.find({ estate: user.estate })
                .populate('createdBy', 'name email')
                .populate('affectedUsers', 'name email')
                .populate('paidBy', 'name email')
                .populate('estate', 'name address')
                .sort({ createdAt: -1 })
                .lean();
        } else {
            // Regular users can only see service charges that affect them
            serviceCharges = await ServiceCharge.find({
                estate: user.estate,
                affectedUsers: user._id
            })
                .populate('createdBy', 'name email')
                .populate('affectedUsers', 'name email')
                .populate('paidBy', 'name email')
                .populate('estate', 'name address')
                .sort({ createdAt: -1 })
                .lean();
        }

        return NextResponse.json(serviceCharges);
    } catch (error) {
        console.error('Error fetching service charges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service charges' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, amount, type, category, dueDate, affectedUsers } = body;

        await dbConnect();
        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user is admin or estate admin
        if (currentUser.role !== 'admin' && currentUser.role !== 'estate_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if user belongs to an estate
        if (!currentUser.estate) {
            return NextResponse.json({ error: 'User must belong to an estate to create service charges' }, { status: 400 });
        }

        const serviceCharge = await ServiceCharge.create({
            title,
            description,
            amount,
            type,
            category,
            dueDate,
            estate: currentUser.estate,
            createdBy: currentUser._id,
            affectedUsers,
            status: 'active',
        });

        const populatedServiceCharge = await ServiceCharge.findById(serviceCharge._id)
            .populate('createdBy', 'name email')
            .populate('affectedUsers', 'name email')
            .populate('estate', 'name address')
            .lean();

        return NextResponse.json(populatedServiceCharge, { status: 201 });
    } catch (error) {
        console.error('Error creating service charge:', error);
        return NextResponse.json(
            { error: 'Failed to create service charge' },
            { status: 500 }
        );
    }
} 