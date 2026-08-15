import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

interface ProductCardProps {
  id: string;
  href: string;
  image: string;
  title: string;
  price?: number;
  index: number;
  variant?: 'product' | 'collection';
  size?: 'small' | 'medium' | 'large';
}

export default function ProductCard({
  id,
  href,
  image,
  title,
  price,
  index,
  variant = 'product',
  size = 'medium'
}: ProductCardProps) {
  // Size configurations
  const sizeConfig = {
    small: {
      imageAspect: 'aspect-square',
      imageWidth: 300,
      titleSize: 'text-xs md:text-sm',
      priceSize: 'text-xs md:text-sm',
      spacing: 'mb-2 md:mb-3'
    },
    medium: {
      imageAspect: 'aspect-[3/4]',
      imageWidth: 400,
      titleSize: 'text-sm md:text-base',
      priceSize: 'text-sm md:text-base',
      spacing: 'mb-4 md:mb-6'
    },
    large: {
      imageAspect: 'aspect-[3/4]',
      imageWidth: 500,
      titleSize: 'text-base md:text-lg',
      priceSize: 'text-base md:text-lg',
      spacing: 'mb-6 md:mb-8'
    }
  };

  const config = sizeConfig[size];
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link to={href} className="group block">
        {variant === 'collection' ? (
          // Collection card with overlay
          <div className={`relative overflow-hidden rounded-lg ${config.imageAspect} ${config.spacing}`}>
            <Image
              src={image || ''}
              alt={title || 'Collection'}
              width={config.imageWidth}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className={`font-heading ${config.titleSize} text-ivory text-center px-3 group-hover:text-soft-gold transition-colors`}>
                {title}
              </h3>
            </div>
          </div>
        ) : (
          // Product card with image and info below
          <>
            <div className={`bg-ivory rounded-lg overflow-hidden ${config.spacing} ${config.imageAspect}`}>
              <Image
                src={image || ''}
                alt={title || 'Product'}
                width={config.imageWidth}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className={`font-heading ${config.titleSize} text-foreground group-hover:text-soft-gold transition-colors`}>
              {title}
            </h3>
            {price !== undefined && (
              <p className={`font-heading ${config.priceSize} text-soft-gold mt-2 md:mt-3`}>
                ${price.toFixed(2)}
              </p>
            )}
          </>
        )}
      </Link>
    </motion.div>
  );
}
