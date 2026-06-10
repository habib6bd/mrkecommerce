import Image from "next/image";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { formatPrice, getProductPrice, starText } from "@/lib/utils";
import AddToCartButton from "@/components/product/AddToCartButton";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) return notFound();

  return (
    <main className="container-shop py-4">
      <div className="card grid gap-8 p-4 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg border bg-slate-50"
              >
                <Image src={img} alt={product.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase text-brand-700">{product.category}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{product.name}</h1>
          <p className="mt-3 text-amber-500">
            {starText(product.rating)}{" "}
            <span className="text-sm text-slate-500">({product.reviewCount} reviews)</span>
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-black text-brand-700">
              {formatPrice(getProductPrice(product))}
            </span>
            {product.discountPrice ? (
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>
          <p className="mt-5 leading-8 text-slate-600">{product.description}</p>

          {product.colors ? (
            <p className="mt-5 text-sm">
              <b>Colors:</b> {product.colors.join(", ")}
            </p>
          ) : null}
          {product.sizes ? (
            <p className="mt-2 text-sm">
              <b>Sizes:</b> {product.sizes.join(", ")}
            </p>
          ) : null}
          <p className="mt-2 text-sm">
            <b>Stock:</b> {product.inStock ? `${product.stock} available` : "Out of stock"}
          </p>

          <AddToCartButton product={product} />
        </div>
      </div>
    </main>
  );
}
