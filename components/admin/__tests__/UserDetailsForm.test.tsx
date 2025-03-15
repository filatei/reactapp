import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserDetailsForm } from '../UserDetailsForm';
import { useToast } from '@/components/ui/use-toast';
import { ReactNode } from 'react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
    useSession: jest.fn()
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

// Mock use-toast
jest.mock('@/components/ui/use-toast', () => ({
    useToast: jest.fn()
}));

interface SelectItemProps {
    value: string;
    children: ReactNode;
}

interface SelectChildProps {
    children: ReactNode;
}

// Mock Radix UI Select component
jest.mock('@/components/ui/select', () => ({
    Select: ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: ReactNode }) => (
        <select data-testid="role-select" value={value} onChange={e => onValueChange(e.target.value)}>
            {children}
        </select>
    ),
    SelectTrigger: ({ children }: SelectChildProps) => children,
    SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
    SelectContent: ({ children }: SelectChildProps) => children,
    SelectItem: ({ value, children }: SelectItemProps) => (
        <option value={value}>{children}</option>
    ),
}));

describe('UserDetailsForm', () => {
    const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        provider: 'google',
        providerId: 'test123',
        address: '123 Test St',
        phoneNumber: '1234567890',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString(),
    };

    const mockRouter = {
        back: jest.fn()
    };

    const mockToast = jest.fn();

    beforeEach(() => {
        (useSession as jest.Mock).mockReturnValue({
            data: { user: { email: 'admin@example.com', role: 'ADMIN' } },
            status: 'authenticated'
        });
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
        global.fetch = jest.fn();
        jest.clearAllMocks();
    });

    it('renders user details correctly', () => {
        render(<UserDetailsForm user={mockUser} />);

        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
        expect(screen.getByTestId('role-select')).toHaveValue(mockUser.role);
    });

    it('handles role change correctly', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: true })
        });

        render(<UserDetailsForm user={mockUser} />);

        const select = screen.getByTestId('role-select');
        fireEvent.change(select, { target: { value: 'ADMIN' } });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                `/api/users/${mockUser.id}/role`,
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ role: 'ADMIN' })
                })
            );
        });
    });

    it('handles role change error', async () => {
        const errorMessage = 'Failed to update user role';
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        render(<UserDetailsForm user={mockUser} />);

        const select = screen.getByTestId('role-select');
        fireEvent.change(select, { target: { value: 'ADMIN' } });

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        });
    });

    it('navigates back when back button is clicked', () => {
        render(<UserDetailsForm user={mockUser} />);

        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);

        expect(mockRouter.back).toHaveBeenCalled();
    });
}); 