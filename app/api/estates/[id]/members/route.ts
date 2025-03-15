import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { toPlainObject } from '@/lib/utils/mongoose';

// GET /api/estates/[id]/members
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get user to check role
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get estate
        const estate = await Estate.findById(params.id)
            .populate('members', 'name email role')
            .populate('estateAdmins', 'name email role');

        if (!estate) {
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        // Check permissions
        if (user.role !== 'admin' &&
            (user.role !== 'estate_admin' || !estate.estateAdmins.includes(user._id))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(toPlainObject(estate));
    } catch (error) {
        console.error('Error fetching estate members:', error);
        return NextResponse.json({ error: 'Failed to fetch estate members' }, { status: 500 });
    }
}

// POST /api/estates/[id]/members
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get admin user
        const admin = await User.findOne({ email: session.user.email });
        if (!admin || (admin.role !== 'admin' && admin.role !== 'estate_admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, role } = body;

        // Get estate
        const estate = await Estate.findById(params.id);
        if (!estate) {
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        // Check if admin has permission to manage this estate
        if (admin.role === 'estate_admin' && !estate.estateAdmins.includes(admin._id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get user to add
        const userToAdd = await User.findById(userId);
        if (!userToAdd) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user is already a member
        if (estate.members.includes(userToAdd._id)) {
            return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
        }

        // Add user to estate
        estate.members.push(userToAdd._id);
        userToAdd.estate = estate._id;

        // If role is estate_admin, add to estate admins
        if (role === 'estate_admin') {
            userToAdd.role = 'estate_admin';
            estate.estateAdmins.push(userToAdd._id);
        }

        await Promise.all([estate.save(), userToAdd.save()]);

        const updatedEstate = await Estate.findById(params.id)
            .populate('members', 'name email role')
            .populate('estateAdmins', 'name email role');

        return NextResponse.json(toPlainObject(updatedEstate));
    } catch (error) {
        console.error('Error adding estate member:', error);
        return NextResponse.json({ error: 'Failed to add estate member' }, { status: 500 });
    }
}

// DELETE /api/estates/[id]/members
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get admin user
        const admin = await User.findOne({ email: session.user.email });
        if (!admin || (admin.role !== 'admin' && admin.role !== 'estate_admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get estate
        const estate = await Estate.findById(params.id);
        if (!estate) {
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        // Check if admin has permission to manage this estate
        if (admin.role === 'estate_admin' && !estate.estateAdmins.includes(admin._id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get user to remove
        const userToRemove = await User.findById(userId);
        if (!userToRemove) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user is a member
        if (!estate.members.includes(userToRemove._id)) {
            return NextResponse.json({ error: 'User is not a member' }, { status: 400 });
        }

        // Remove user from estate
        estate.members = estate.members.filter(id => !id.equals(userToRemove._id));
        estate.estateAdmins = estate.estateAdmins.filter(id => !id.equals(userToRemove._id));
        userToRemove.estate = undefined;
        userToRemove.role = 'user';

        await Promise.all([estate.save(), userToRemove.save()]);

        const updatedEstate = await Estate.findById(params.id)
            .populate('members', 'name email role')
            .populate('estateAdmins', 'name email role');

        return NextResponse.json(toPlainObject(updatedEstate));
    } catch (error) {
        console.error('Error removing estate member:', error);
        return NextResponse.json({ error: 'Failed to remove estate member' }, { status: 500 });
    }
} 