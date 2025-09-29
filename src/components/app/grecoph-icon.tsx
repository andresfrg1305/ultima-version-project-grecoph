
import React from 'react';
import { Building } from 'lucide-react';

export const GrecophIcon = ({ className }: { className?: string }) => (
    <Building className={className || "h-6 w-6 text-primary"} />
);
