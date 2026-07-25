import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { storeApi } from '../api/storeApi'; 
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Modal & Form States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Multi-Image State ---
  const [imageFiles, setImageFiles] = useState([]);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    images: []
  });

  const categories = ['Electronics', 'Clothing', 'Home', 'Accessories', 'Fitness'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await storeApi.getProducts(); 
      setProducts(data);
    } catch (err) {
      toast.error("Failed to load inventory data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setProductData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'Electronics',
        stock: product.stock || '',
        images: product.images || []
      });
    } else {
      setEditingId(null);
      setProductData({ name: '', description: '', price: '', category: 'Electronics', stock: '', images: [] });
    }
    setImageFiles([]); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImageFiles([]);
    setProductData({ name: '', description: '', price: '', category: 'Electronics', stock: '', images: [] });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImages = productData.images || [];

      // 1. If new physical files were selected, upload to Cloudinary first
      if (imageFiles.length > 0) {
        toast.loading("Uploading gallery to Cloudinary...", { id: 'upload-toast' });
        finalImages = await adminApi.uploadImages(imageFiles); 
        toast.success("Gallery uploaded successfully!", { id: 'upload-toast' });
      } else if (finalImages.length === 0) {
        toast.error("Please select at least one product image.", { id: 'upload-toast' });
        setIsUploading(false);
        return;
      }

      // 2. Format payload safely
      const payload = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        stock: Number(productData.stock),
        category: productData.category,
        images: finalImages 
      };

      // 3. Save to Database using the confirmed endpoints
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        toast.success("Product updated successfully!");
      } else {
        await adminApi.createProduct(payload);
        toast.success("New product launched!");
      }

      fetchProducts();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process product data.", { id: 'upload-toast' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this item?")) {
      try {
        await adminApi.deleteProduct(id);
        toast.success("Product deleted successfully.");
        fetchProducts();
      } catch (err) {
        toast.error("Failed to delete product.");
      }
    }
  };

  return (
    <div className="p-6 mx-auto duration-500 max-w-7xl md:p-8 animate-in fade-in">
      <BackButton />
      {/* Header Panel */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-500">Add, update, or remove storefront products.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          Add New Product
        </button>
      </div>

      {/* Inventory Table Grid */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-black tracking-wider uppercase border-b bg-slate-50/50 text-slate-500 border-slate-100">
                <th className="p-4 pl-6">Media</th>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 mb-4 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
                      <span className="font-medium text-slate-500">Loading Database...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 font-medium text-center text-slate-500">No products found. Start by adding one!</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-slate-50/50">
                    <td className="p-4 pl-6">
                      <div className="relative w-12 h-12 overflow-hidden border rounded-lg bg-slate-100 border-slate-200 group">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-slate-300">No Img</div>
                        )}
                        {product.images && product.images.length > 1 && (
                           <div className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 rounded-tl-md backdrop-blur-sm">
                              +{product.images.length - 1}
                           </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{product.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">{product.category}</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${product.stock > 0 ? 'text-slate-700' : 'text-red-500'}`}>
                        {product.stock > 0 ? product.stock : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenModal(product)} className="transition-colors text-slate-400 hover:text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="transition-colors text-slate-400 hover:text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action / Creation Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Product' : 'Create New Product'}</h2>
              <button onClick={handleCloseModal} className="p-1 transition-colors bg-white border rounded-full shadow-sm text-slate-400 hover:text-slate-600 border-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div className="col-span-full">
                  <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Product Name</label>
                  <input type="text" required value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="e.g. Wireless Headphones" />
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Price (USD)</label>
                  <input type="number" step="0.01" required value={productData.price} onChange={(e) => setProductData({...productData, price: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="99.99" />
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Available Stock</label>
                  <input type="number" required value={productData.stock} onChange={(e) => setProductData({...productData, stock: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="50" />
                </div>

                <div className="col-span-full">
                  <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Category</label>
                  <select value={productData.category} onChange={(e) => setProductData({...productData, category: e.target.value})} className="w-full px-4 py-3 text-sm font-bold transition-colors border outline-none cursor-pointer bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500 text-slate-700">
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-full">
                  <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Description</label>
                  <textarea required rows="3" value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none resize-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="Detail the specifications and features..."></textarea>
                </div>

                {/* Cloudinary Media Ingestion Dropzone */}
                <div className="col-span-full">
                  <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Product Gallery (Up to 5 images)</label>
                  
                  {editingId && imageFiles.length === 0 && productData.images && productData.images.length > 0 && (
                    <div className="flex gap-2 pb-2 mb-4 overflow-x-auto no-scrollbar">
                      {productData.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative w-20 h-20 overflow-hidden border shadow-sm shrink-0 border-slate-200 rounded-xl">
                          <img src={imgUrl} alt={`Existing ${idx}`} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}

                  {imageFiles.length > 0 && (
                    <div className="flex gap-2 pb-2 mb-4 overflow-x-auto no-scrollbar">
                      {Array.from(imageFiles).map((file, idx) => (
                        <div key={idx} className="relative w-20 h-20 overflow-hidden border-2 shadow-md shrink-0 border-emerald-500 rounded-xl">
                          <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 transition-all duration-300 border-2 border-dashed cursor-pointer border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-400">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <svg className={`w-8 h-8 mb-3 ${imageFiles.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p className={`mb-1 text-sm font-bold ${imageFiles.length > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {imageFiles.length > 0 ? `${imageFiles.length} files selected` : "Click to select multiple files"}
                        </p>
                        <p className="text-xs text-slate-400">Hold Ctrl/Cmd to select up to 5 images</p>
                      </div>
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => setImageFiles(Array.from(e.target.files).slice(0, 5))} 
                      />
                    </label>
                  </div>
                </div>

              </form>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                form="productForm" 
                type="submit" 
                disabled={isUploading}
                className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {isUploading ? 'Processing...' : (editingId ? 'Save Changes' : 'Publish Product')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageProducts;