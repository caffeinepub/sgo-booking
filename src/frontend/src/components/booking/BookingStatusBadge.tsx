import React from 'react';
import { Badge } from '../ui/badge';
import { BookingStatus } from '../../types/extended-backend';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case BookingStatus.booked:
      case BookingStatus.checkedIn:
        return 'default';
      case BookingStatus.pendingTransfer:
        return 'secondary';
      case BookingStatus.paymentFailed:
      case BookingStatus.canceled:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getLabel = () => {
    switch (status) {
      case BookingStatus.pendingTransfer:
        return 'Pending Transfer';
      case BookingStatus.paymentFailed:
        return 'Payment Failed';
      case BookingStatus.booked:
        return 'Booked';
      case BookingStatus.checkedIn:
        return 'Checked In';
      case BookingStatus.canceled:
        return 'Canceled';
      default:
        return status;
    }
  };

  return <Badge variant={getVariant()}>{getLabel()}</Badge>;
}
