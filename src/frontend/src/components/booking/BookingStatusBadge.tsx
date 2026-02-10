import React from 'react';
import { Badge } from '../ui/badge';
import { BookingStatus } from '../../types/extended-backend';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const getStatusVariant = (status: BookingStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case BookingStatus.booked:
        return 'default';
      case BookingStatus.pendingTransfer:
        return 'secondary';
      case BookingStatus.checkedIn:
        return 'default';
      case BookingStatus.canceled:
        return 'destructive';
      case BookingStatus.paymentFailed:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.booked:
        return 'Booked';
      case BookingStatus.pendingTransfer:
        return 'Pending Transfer';
      case BookingStatus.checkedIn:
        return 'Checked In';
      case BookingStatus.canceled:
        return 'Canceled';
      case BookingStatus.paymentFailed:
        return 'Payment Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant={getStatusVariant(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
