import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServiceCharge } from '@/models/ServiceCharge';
import { User } from '@/models/User';
import dbConnect from '@/lib/mongoose';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
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
            return NextResponse.json({ error: 'User must belong to an estate' }, { status: 400 });
        }

        const serviceCharge = await ServiceCharge.findOne({
            _id: params.id,
            estate: user.estate
        })
            .populate('createdBy', 'name email')
            .populate('affectedUsers', 'name email')
            .populate('paidBy', 'name email')
            .populate('estate', 'name address')
            .lean();

        if (!serviceCharge) {
            return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });
        }

        // Regular users can only view service charges that affect them
        if (user.role !== 'admin' && user.role !== 'estate_admin' &&
            !serviceCharge.affectedUsers.some(u => u._id.toString() === user._id.toString())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(serviceCharge);
    } catch (error) {
        console.error('Error fetching service charge:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service charge' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        await dbConnect();

        // Get user to check role and estate
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only admins and estate admins can update service charges
        if (user.role !== 'admin' && user.role !== 'estate_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // If user doesn't belong to an estate, they can't update service charges
        if (!user.estate) {
            return NextResponse.json({ error: 'User must belong to an estate' }, { status: 400 });
        }

        const serviceCharge = await ServiceCharge.findOne({
            _id: params.id,
            estate: user.estate
        });

        if (!serviceCharge) {
            return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });
        }

        // Update the service charge
        Object.assign(serviceCharge, body);
        await serviceCharge.save();

        const updatedServiceCharge = await ServiceCharge.findById(params.id)
            .populate('createdBy', 'name email')
            .populate('affectedUsers', 'name email')
            .populate('paidBy', 'name email')
            .populate('estate', 'name address')
            .lean();

        return NextResponse.json(updatedServiceCharge);
    } catch (error) {
        console.error('Error updating service charge:', error);
        return NextResponse.json(
            { error: 'Failed to update service charge' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        // Only admins and estate admins can delete service charges
        if (user.role !== 'admin' && user.role !== 'estate_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // If user doesn't belong to an estate, they can't delete service charges
        if (!user.estate) {
            return NextResponse.json({ error: 'User must belong to an estate' }, { status: 400 });
        }

        const serviceCharge = await ServiceCharge.findOne({
            _id: params.id,
            estate: user.estate
        });

        if (!serviceCharge) {
            return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });
        }

        await serviceCharge.deleteOne();
        return NextResponse.json({ message: 'Service charge deleted successfully' });
    } catch (error) {
        console.error('Error deleting service charge:', error);
        return NextResponse.json(
            { error: 'Failed to delete service charge' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        await dbConnect();
        const serviceCharge = await ServiceCharge.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        ).populate('createdBy', 'name email')
            .populate('affectedUsers', 'name email')
            .populate('paidBy', 'name email');

        if (!serviceCharge) {
            return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });
        }

        return NextResponse.json(serviceCharge);
    } catch (error) {
        console.error('Error updating service charge:', error);
        return NextResponse.json(
            { error: 'Failed to update service charge' },
            { status: 500 }
        );
    }
} 