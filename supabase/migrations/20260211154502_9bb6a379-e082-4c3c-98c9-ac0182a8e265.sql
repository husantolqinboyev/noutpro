
-- Create product_images table for multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images of active products
CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_images.product_id AND products.is_active = true));

-- Admins can view all
CREATE POLICY "Admins can view all product images"
  ON public.product_images FOR SELECT
  USING (is_admin());

-- Admins can manage
CREATE POLICY "Admins can insert product images"
  ON public.product_images FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product images"
  ON public.product_images FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete product images"
  ON public.product_images FOR DELETE
  USING (is_admin());
