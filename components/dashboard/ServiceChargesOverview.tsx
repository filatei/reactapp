"use client";

import { useState } from 'react';
import { ServiceChargeWithUsers } from '@/types/service-charge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentModal } from '../payments/PaymentModal';
import { CreditCard } from 'lucide-react';

interface ServiceChargesOverviewProps {
    serviceCharges: ServiceChargeWithUsers[];
}

export function ServiceChargesOverview({ serviceCharges }: ServiceChargesOverviewProps) {
    const [selectedCharge, setSelectedCharge] = useState<ServiceChargeWithUsers | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const outstandingCharges = serviceCharges.filter(charge => 
        ['active', 'unpaid'].includes(charge.status)
    );
    const paidCharges = serviceCharges.filter(charge => charge.status === 'paid');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-500/10 text-green-500 dark:bg-green-500/20';
            case 'active':
                return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
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

    const handlePayment = (charge: ServiceChargeWithUsers) => {
        setSelectedCharge(charge);
        setIsPaymentModalOpen(true);
    };

    const ServiceChargeCard = ({ charge }: { charge: ServiceChargeWithUsers }) => (
        <Card className="bg-card dark:bg-card">
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
                    {['active', 'unpaid'].includes(charge.status) && (
                        <Button
                            size="sm"
                            onClick={() => handlePayment(charge)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Make Payment
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4">
            <Tabs defaultValue="outstanding" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="outstanding">
                        Outstanding ({outstandingCharges.length})
                    </TabsTrigger>
                    <TabsTrigger value="paid">
                        Paid ({paidCharges.length})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                        All ({serviceCharges.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="outstanding" className="space-y-4 mt-4">
                    {outstandingCharges.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No outstanding service charges
                        </p>
                    ) : (
                        outstandingCharges.map((charge) => (
                            <ServiceChargeCard key={charge._id.toString()} charge={charge} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="paid" className="space-y-4 mt-4">
                    {paidCharges.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No paid service charges
                        </p>
                    ) : (
                        paidCharges.map((charge) => (
                            <ServiceChargeCard key={charge._id.toString()} charge={charge} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4 mt-4">
                    {serviceCharges.map((charge) => (
                        <ServiceChargeCard key={charge._id.toString()} charge={charge} />
                    ))}
                </TabsContent>
            </Tabs>

            {selectedCharge && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedCharge(null);
                    }}
                    serviceCharge={selectedCharge}
                />
            )}
        </div>
    );
} 