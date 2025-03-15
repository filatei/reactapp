"use client";

import { useState } from 'react';
import { ServiceChargeWithUsers } from '@/types/service-charge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmationModal } from './ConfirmationModal';
import { PaymentModal } from '../payments/PaymentModal';
import { useSession } from 'next-auth/react';
import { 
    CreditCard, 
    Trash2, 
    CheckCircle, 
    XCircle
} from 'lucide-react';

interface ServiceChargeListProps {
    serviceCharges: ServiceChargeWithUsers[];
}

type ModalType = 'delete' | 'markPaid' | 'markUnpaid' | 'payment' | null;

export function ServiceChargeList({ serviceCharges }: ServiceChargeListProps) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [selectedCharge, setSelectedCharge] = useState<ServiceChargeWithUsers | null>(null);
    const [modalType, setModalType] = useState<ModalType>(null);

    const handleAction = async (action: ModalType, charge: ServiceChargeWithUsers) => {
        setSelectedCharge(charge);
        setModalType(action);
    };

    const handleConfirm = async () => {
        if (!selectedCharge || !modalType) return;

        try {
            let endpoint = '';
            let method = 'PUT';
            let successMessage = '';

            switch (modalType) {
                case 'delete':
                    endpoint = `/api/service-charges/${selectedCharge._id}`;
                    method = 'DELETE';
                    successMessage = 'Service charge deleted successfully';
                    break;
                case 'markPaid':
                    endpoint = `/api/service-charges/${selectedCharge._id}/mark-paid`;
                    successMessage = 'Service charge marked as paid';
                    break;
                case 'markUnpaid':
                    endpoint = `/api/service-charges/${selectedCharge._id}/mark-unpaid`;
                    successMessage = 'Service charge marked as unpaid';
                    break;
                default:
                    return;
            }

            const response = await fetch(endpoint, { method });
            if (!response.ok) {
                throw new Error('Failed to perform action');
            }

            toast({
                title: 'Success',
                description: successMessage,
            });

            // Refresh the page to update the list
            window.location.reload();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'An error occurred',
                variant: 'destructive',
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-500/10 text-green-500 dark:bg-green-500/20';
            case 'active':
                return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
            case 'cancelled':
                return 'bg-red-500/10 text-red-500 dark:bg-red-500/20';
            case 'unpaid':
                return 'bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'maintenance':
                return 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20';
            case 'repairs':
                return 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20';
            case 'utilities':
                return 'bg-teal-500/10 text-teal-500 dark:bg-teal-500/20';
            case 'security':
                return 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20';
        }
    };

    const getModalConfig = () => {
        if (!selectedCharge) return null;

        switch (modalType) {
            case 'delete':
                return {
                    title: 'Delete Service Charge',
                    description: 'Are you sure you want to delete this service charge? This action cannot be undone.',
                    confirmText: 'Delete',
                    variant: 'destructive' as const,
                };
            case 'markPaid':
                return {
                    title: 'Mark as Paid',
                    description: 'Are you sure you want to mark this service charge as paid?',
                    confirmText: 'Mark Paid',
                };
            case 'markUnpaid':
                return {
                    title: 'Mark as Unpaid',
                    description: 'Are you sure you want to mark this service charge as unpaid?',
                    confirmText: 'Mark Unpaid',
                };
            default:
                return null;
        }
    };

    const modalConfig = getModalConfig();

    return (
        <div className="space-y-4">
            {serviceCharges.map((charge) => (
                <Card key={charge._id.toString()} className="bg-card dark:bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            {charge.title}
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Badge className={getStatusColor(charge.status)}>
                                {charge.status}
                            </Badge>
                            <Badge className={getCategoryColor(charge.category)}>
                                {charge.category}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                            {charge.description}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-foreground">
                                {new Intl.NumberFormat('en-NG', {
                                    style: 'currency',
                                    currency: 'NGN'
                                }).format(charge.amount)}
                            </div>
                            {session?.user?.role === 'admin' && (
                                <div className="flex space-x-2">
                                    {charge.status !== 'paid' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAction('markPaid', charge)}
                                            className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Mark Paid
                                        </Button>
                                    )}
                                    {charge.status === 'paid' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAction('markUnpaid', charge)}
                                            className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                        >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Mark Unpaid
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleAction('delete', charge)}
                                        className="text-white hover:text-white"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                            {session?.user?.role !== 'admin' && charge.status === 'active' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleAction('payment', charge)}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Make Payment
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {modalConfig && (
                <ConfirmationModal
                    isOpen={!!modalType && modalType !== 'payment'}
                    onClose={() => setModalType(null)}
                    onConfirm={handleConfirm}
                    title={modalConfig.title}
                    description={modalConfig.description}
                    confirmText={modalConfig.confirmText}
                    variant={modalConfig.variant}
                />
            )}

            {selectedCharge && modalType === 'payment' && (
                <PaymentModal
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    serviceCharge={selectedCharge}
                />
            )}
        </div>
    );
} 