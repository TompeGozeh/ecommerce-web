import React, { useEffect, useState } from 'react';
import API from '../api';
import { useCartStore } from '../store/useCartStore';
import { Search, ShoppingBag, Sparkles, Shield, Layers, Check } from 'lucide-react';

const HIGHLIGHTS = [
  { name: 'NEW', tag: 'Drop 2026' },
  { name: 'BUZOS', tag: '350g Heavy' },
  { name: 'DEUS', tag: 'Edicion Limitada' },
  { name: 'YOURSELF', tag: 'Oversized' },
  { name: 'TONY MONTANA', tag: 'Graphic Tee' },
  { name: 'SHARP', tag: 'Minimal' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'NINO'];

export const Catalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedHighlight, setSelectedHighlight] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedHighlight]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/products/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products?search=' + search;
      if (selectedCategory) url += '&categoryId=' + selectedCategory;
      const res = await API.get(url);
      
      let fetchedProducts = res.data.products || res.data || [];

      // Filtrar localmente por highlight si se seleccionó uno específico (como DEUS o BUZOS)
      if (selectedHighlight && selectedHighlight !== 'NEW') {
        fetchedProducts = fetchedProducts.filter((p: any) => 
          p.highlight?.toUpperCase() === selectedHighlight.toUpperCase() ||
          p.title?.toUpperCase().includes(selectedHighlight.toUpperCase()) ||
          p.category?.name?.toUpperCase() === selectedHighlight.toUpperCase()
        );
      }

      setProducts(fetchedProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddProduct = (product: any) => {
    const chosenSize = selectedSizes[product.id] || 'L';
    addToCart({
      ...product,
      title: product.title + ' [Talla: ' + chosenSize + ']',
    });
    setAddedFeedback(product.id);
    setTimeout(() => setAddedFeedback(null), 1500);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100">
      <section className="relative border-b border-zinc-800/80 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles size={13} /> @onlyblack_08 | Coleccion Oficial
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              El Color Negro <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600">No Mancha.</span>
            </h1>

            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
              Prendas urbanas confeccionadas en <strong className="text-white">Algodon Peruano de alto gramaje (200 / 230 / 250 / 350g)</strong>. Cortes <strong className="text-white">Oversized & Regular</strong> disenados para mantener su negro intenso lavado tras lavado.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <Layers size={16} className="text-amber-400 mb-1" />
                <p className="text-xs font-bold text-white">200g - 350g</p>
                <p className="text-[10px] text-zinc-500">Alto Gramaje</p>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <Shield size={16} className="text-amber-400 mb-1" />
                <p className="text-xs font-bold text-white">100% Peruano</p>
                <p className="text-[10px] text-zinc-500">Negro Reactivo</p>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <ShoppingBag size={16} className="text-amber-400 mb-1" />
                <p className="text-xs font-bold text-white">S a XL + Nino</p>
                <p className="text-[10px] text-zinc-500">Fit Oversized / Reg</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-4 text-center md:text-left">
              Lineas Destacadas
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-3 gap-4">
              {HIGHLIGHTS.map((item) => {
                const isActive = selectedHighlight === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.name === 'NEW') {
                        setSelectedHighlight('');
                        setSearch('');
                      } else {
                        setSelectedHighlight(isActive ? '' : item.name);
                      }
                    }}
                    className="flex flex-col items-center group"
                  >
                    <div className={`w-16 h-16 rounded-full p-[2px] transition ${isActive ? 'bg-amber-400 ring-2 ring-amber-400' : 'bg-gradient-to-tr from-zinc-700 via-amber-500/60 to-zinc-600 group-hover:from-amber-400 group-hover:to-red-600'}`}>
                      <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-900">
                        <span className={`text-[10px] font-black tracking-wider uppercase text-center px-1 ${isActive ? 'text-amber-400' : 'text-white'}`}>
                          {item.name}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold mt-1.5 transition ${isActive ? 'text-amber-400' : 'text-zinc-300 group-hover:text-white'}`}>
                      {item.name}
                    </span>
                    <span className="text-[9px] text-zinc-500">{item.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar drop, buzo, camiseta oversized..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedHighlight('');
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => { setSelectedCategory(''); setSelectedHighlight(''); }}
              className={selectedCategory === '' && !selectedHighlight ? 'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap bg-white text-black' : 'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCategory(c.id); setSelectedHighlight(''); }}
                className={selectedCategory === c.id ? 'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap bg-white text-black' : 'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {selectedHighlight && (
          <div className="mb-6 flex items-center justify-between bg-amber-400/10 border border-amber-400/30 px-4 py-3 rounded-xl">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Filtrando por línea destacada: {selectedHighlight}
            </span>
            <button
              onClick={() => setSelectedHighlight('')}
              className="text-xs text-zinc-400 hover:text-white uppercase font-bold underline"
            >
              Limpiar filtro
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-zinc-500 text-xs uppercase tracking-widest py-16">Cargando coleccion...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
            <p className="text-zinc-400 text-sm">No hay prendas disponibles con ese filtro ({selectedHighlight || search}).</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedHighlight(''); }}
              className="mt-4 text-xs text-amber-400 underline uppercase tracking-wider font-bold"
            >
              Ver toda la coleccion
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const currentSize = selectedSizes[product.id] || 'L';
              const isAdded = addedFeedback === product.id;

              return (
                <div
                  key={product.id}
                  className="group bg-zinc-900/70 border border-zinc-800/90 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative overflow-hidden bg-zinc-950 aspect-[4/5]">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600';
                        }}
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase font-black tracking-widest bg-black/85 backdrop-blur-md text-white px-2.5 py-1 rounded border border-zinc-800">
                          {product.category?.name || 'ONLY BLACK'}
                        </span>
                        {product.highlight && (
                          <span className="text-[9px] uppercase font-bold tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded">
                            {product.highlight}
                          </span>
                        )}
                      </div>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase bg-red-600/90 text-white px-2 py-0.5 rounded">
                          Ultimas {product.stock} uds
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-amber-400 transition">
                        {product.title}
                      </h3>
                      <p className="text-zinc-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="mt-4">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1.5">
                          Seleccionar Talla:
                        </span>
                        <div className="flex gap-1.5">
                          {SIZES.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleSelectSize(product.id, size)}
                              className={currentSize === size ? 'flex-1 py-1 rounded text-[10px] font-bold transition bg-white text-black' : 'flex-1 py-1 rounded text-[10px] font-bold transition bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-600'}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center bg-zinc-950/40">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Precio</span>
                      <span className="text-lg font-black text-white">${product.price.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => handleAddProduct(product)}
                      className={isAdded ? 'text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition bg-emerald-500 text-black' : 'text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition bg-white hover:bg-amber-400 text-black'}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} /> Agregado
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} /> Anadir
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};