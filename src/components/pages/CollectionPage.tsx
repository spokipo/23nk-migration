import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Collection {
  _id: string;
  name?: string;
  description?: string;
}

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Products[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const [collectionResult, productsResult] = await Promise.all([
        BaseCrudService.getById<Collection>('collections', id),
        BaseCrudService.getAll<Products>('products', { multiRef: ['Collections'] })
      ]);

      setCollection(collectionResult);
      
      // Filter products that belong to this collection
      // Products have Collections field (multi-reference) that contains collection IDs
      const filteredProducts = productsResult.items.filter(
        (product: any) => product.Collections?.some((col: any) => col._id === id)
      );
      setProducts(filteredProducts);
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-[120rem] mx-auto px-6 md:px-20" style={{ minHeight: '60vh' }}>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : !collection ? (
            <div className="text-center py-20">
              <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-4">Collection Not Found</h1>
              <Link to="/" className="font-heading text-base text-soft-gold hover:underline">
                Return to Home
              </Link>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12 md:mb-16"
              >
                <h1 className="font-heading text-4xl md:text-6xl text-foreground mb-4 md:mb-6">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="font-heading text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
                    {collection.description}
                  </p>
                )}
              </motion.div>

              {products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-heading text-lg text-foreground/60">
                    No products in this collection yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Link to={`/product/${product._id}`} className="group block">
                        <div className="bg-ivory rounded-lg overflow-hidden mb-4 transition-transform group-hover:scale-[1.02] aspect-[3/4]">
                          <Image
                            src={product.mainImage || ''}
                            alt={product.name || 'Corset'}
                            width={500}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="font-heading text-lg md:text-2xl text-foreground mb-2 group-hover:text-soft-gold transition-colors">
                            {product.name}
                          </h3>
                          <p className="font-heading text-lg md:text-xl text-soft-gold mb-4">
                            ${product.price?.toFixed(2)}
                          </p>
                          <Button
                            className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-lg py-3 text-xs tracking-widest font-heading"
                          >
                            ORDER CUSTOM TAILORING
                          </Button>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
