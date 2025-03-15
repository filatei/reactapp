"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Building2, Bitcoin, Wallet } from 'lucide-react';
import { ServiceChargeWithUsers } from '@/types/service-charge';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceCharge: ServiceChargeWithUsers;
}

export function PaymentModal({ isOpen, onClose, serviceCharge }: PaymentModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handlePayment = async (provider: string, method: string) => {
        try {
            setLoading(true);
            const response = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceChargeId: serviceCharge._id,
                    provider,
                    paymentMethod: method,
                    amount: serviceCharge.amount,
                    description: serviceCharge.description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize payment');
            }

            // Redirect to payment page
            router.push(data.redirectUrl);
        } catch (error) {
            console.error('Payment error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to process payment',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Make Payment</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground">{serviceCharge.title}</h3>
                        <p className="text-sm text-muted-foreground">{serviceCharge.description}</p>
                        <p className="text-xl font-bold text-foreground mt-2">
                            Amount: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(serviceCharge.amount)}
                        </p>
                    </div>

                    <Tabs defaultValue="card" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="card">
                                <CreditCard className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="bank">
                                <Building2 className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="crypto">
                                <Bitcoin className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="wallet">
                                <Wallet className="h-4 w-4" />
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="card">
                            <Card>
                                <CardContent className="space-y-4 pt-4">
                                    <Button
                                        className="w-full"
                                        onClick={() => handlePayment('flutterwave', 'card')}
                                        disabled={loading}
                                    >
                                        Pay with Card
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="bank">
                            <Card>
                                <CardContent className="space-y-4 pt-4">
                                    <Button
                                        className="w-full"
                                        onClick={() => handlePayment('monnify', 'bank-transfer')}
                                        disabled={loading}
                                    >
                                        Bank Transfer
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="crypto">
                            <Card>
                                <CardContent className="space-y-4 pt-4">
                                    <Button
                                        className="w-full"
                                        onClick={() => handlePayment('flutterwave', 'crypto')}
                                        disabled={loading}
                                    >
                                        Pay with Crypto
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="wallet">
                            <Card>
                                <CardContent className="space-y-4 pt-4">
                                    <Button
                                        className="w-full"
                                        onClick={() => handlePayment('flutterwave', 'wallet')}
                                        disabled={loading}
                                    >
                                        Pay with Wallet
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
} 