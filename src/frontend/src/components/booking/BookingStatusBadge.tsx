import React from 'react';
import { Badge } from '../ui/badge';
import { BookingStatus } from '../../backend';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case 'booked':
        return 'default';
      case 'checkedIn':
        return 'secondary';
      case 'pendingTransfer':
        return 'outline';
      case 'canceled':
      case 'paymentFailed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'booked':
        return 'Booked';
      case 'checkedIn':
        return 'Checked In';
      case 'pendingTransfer':
        return 'Pending Transfer';
      case 'canceled':
        return 'Canceled';
      case 'paymentFailed':
        return 'Payment Failed';
      default:
        return status;
    }
  };

  return <Badge variant={getVariant()}>{getLabel()}</Badge>;
}
