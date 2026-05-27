import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService.js';
import { getCategories } from '../services/categoryService.js';
import { getBrands, createBrand } from '../services/brandService.js';

// Custom hook to manage products, categories, and brands
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Data fetching actions
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands", error);
    }
  };

  // Brand operations
  const handleCreateBrand = async (brandData) => {
    const result = await createBrand(brandData);
    await fetchBrands();
    return result;
  };

  // Product operations
  const handleCreateProduct = async (productData) => {
    const result = await createProduct(productData);
    await fetchProducts();
    return result;
  };

  const handleUpdateProduct = async (id, productData) => {
    const result = await updateProduct(id, productData);
    await fetchProducts();
    return result;
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    await fetchProducts();
  };

  // Initialize all resources on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  return {
    products,
    categories,
    brands,
    isLoading,
    fetchProducts,
    fetchCategories,
    fetchBrands,
    createBrand: handleCreateBrand,
    createProduct: handleCreateProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct
  };
};
