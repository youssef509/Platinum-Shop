import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";

const ProductDetailsPage = async (props: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await props.params;
    const product = await getProductBySlug(slug);
    if (!product) {
        notFound();
    }
    const cart = await getMyCart();
    return <>
        <section>
            <div className="grid grid-cols-1 md:grid-cols-5">
                {/* Images Column */}
                <div className="col-span-2">
                    <ProductImages images={product.images} />
                </div>
                {/* Details Column */}
                <div className="col-span-2 p-5">
                    <div className="flex flex-col gap-6">
                        <p>
                            {product.brand} {product.category}
                        </p>
                        <h1 className="h3 font-bold">{product.name}</h1>
                         <p>
                        {product.rating} of {product.numReviews} Reviews
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <ProductPrice value={Number(product.price)} />
                            {product.stock > 0 ? (
                                <Badge variant="outline" className="bg-green-500 text-white">
                                    In Stock
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-white">
                                    Out of Stock
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="mt-10">
                        <p className="font-semibold">Description</p>
                        <p>{product.description}</p>
                    </div>
                </div>
                {/* Actions Column */}
                <div>
                    <Card>
                        <CardContent className="p-4">
                            <div className="mb-2 flex justify-between">
                                <div>Price</div>
                                <div>
                                    <ProductPrice value={Number(product.price)} />
                                </div>
                            </div>
                            <div className="mb-2 flex justify-between">
                                <div>Stock</div>
                                <div>
                                    {product.stock > 0 ? (
                                        <Badge variant="outline" className="bg-green-500 text-white">
                                            In Stock
                                        </Badge>

                                    ) : (
                                        <Badge variant="destructive" className="text-white">
                                            Out of Stock
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            
                            {product.stock > 0 && (
                                <div className="mt-4">
                                    <AddToCart 
                                    cart={cart ? { ...cart, sessionCardId: cart.sessionCardId ?? "" } : undefined} 
                                    item={{
                                        productId: product.id,
                                        name: product.name,
                                        slug: product.slug,
                                        image: product.images![0],
                                        price: product.price,
                                        qty: 1
                                    }} />
                                </div>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    </>;
}
 
export default ProductDetailsPage;
