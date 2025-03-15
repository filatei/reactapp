import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { toPlainObject } from '@/lib/utils/mongoose';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get user to check role and estate
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let estates;
        if (user.role === 'admin') {
            // App admins can see all estates
            estates = await Estate.find()
                .populate('createdBy', 'name email')
                .populate('estateAdmins', 'name email')
                .populate('members', 'name email')
                .sort({ name: 1 });
        } else if (user.role === 'estate_admin') {
            // Estate admins can see their estates
            estates = await Estate.find({
                $or: [
                    { estateAdmins: user._id },
                    { members: user._id }
                ]
            })
                .populate('createdBy', 'name email')
                .populate('estateAdmins', 'name email')
                .populate('members', 'name email')
                .sort({ name: 1 });
        } else {
            // Regular users can only see their estate
            estates = await Estate.find({
                members: user._id
            })
                .populate('createdBy', 'name email')
                .populate('estateAdmins', 'name email')
                .populate('members', 'name email')
                .sort({ name: 1 });
        }

        return NextResponse.json(toPlainObject(estates));
    } catch (error) {
        console.error('Error fetching estates:', error);
        return NextResponse.json({ error: 'Failed to fetch estates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        await dbConnect();

        const estate = await Estate.create({
            ...body,
            admins: [session.user.id],
            members: [session.user.id],
        });

        // Revalidate the estates page
        revalidatePath('/admin/estates');

        return NextResponse.json(estate);
    } catch (error) {
        console.error('Error creating estate:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 