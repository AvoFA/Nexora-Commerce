import { useState, useEffect } from "react";
import { getProductById, getSimilarProducts } from "../../services/productService.js";

export const useProductData = (id) => {
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!id || !product) return;
      try {
        const similar = await getSimilarProducts(id);
        setSimilarProducts(similar);
      } catch (err) {
        setSimilarProducts([]);
      }
    };
    fetchSimilarProducts();
  }, [id, product]);

  return { product, similarProducts, isLoading, error };
};
