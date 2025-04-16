import React from 'react';
import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;
type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
    return (
        <div className={`rounded-2xl shadow-md border border-gray-200 bg-white ${className}`} {...props} />
    );
}

export function CardContent({ className = '', ...props }: CardContentProps) {
    return (
        <div className={`p-4 ${className}`} {...props} />
    );
}