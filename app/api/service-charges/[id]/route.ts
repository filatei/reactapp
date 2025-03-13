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
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const serviceCharge = await ServiceCharge.findById(params.id)
            .populate('createdBy', 'name email')
            .populate('affectedUsers', 'name email')
            .populate('paidBy', 'name email');

        if (!serviceCharge) {
            return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });
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
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, amount, type, category, dueDate, status } = body;

        const serviceCharge = await ServiceCharge.findByIdAndUpdate(
            params.id,
            {
                title,
                description,
                amount,
                type,
                category,
                dueDate,
                status,
            },
            { new: true }
        )
            .populate('createdBy', 'name email')
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

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const serviceCharge = await ServiceCharge.findByIdAndDelete(params.id);

        if (!serviceCharge) {
            return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Service charge deleted successfully' });
    } catch (error) {
        console.error('Error deleting service charge:', error);
        return NextResponse.json(
            { error: 'Failed to delete service charge' },
            { status: 500 }
        );
    }
} 