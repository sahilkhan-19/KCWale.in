import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { menuService } from "../services/menu.service"
import { FoodCard } from "../components/FoodCard"
import { Search, Star, Clock, Check, Loader2 } from "lucide-react"

export const Menu: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>("Hot Selling")
  const [vegFilter, setVegFilter] = useState<boolean | null>(null) // null = all, true = veg, false = non-veg

  // Query categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: menuService.getCategories,
  })

  // Query all products with filters (disabled when on Hot Selling to avoid unnecessary fetch)
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", searchTerm, selectedCategory],
    queryFn: () =>
      menuService.getAllProducts({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        limit: 50,
      }),
    enabled: selectedCategory !== "Hot Selling",
  })

  // Query featured products (Hot Selling)
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: menuService.getFeaturedProducts,
  })

  // Client-side Veg/Non-Veg filter since it's determined based on naming (from backend schema)
  const isVegProduct = (name: string, category: string) => {
    const lower = `${name} ${category}`.toLowerCase()
    return !(
      lower.includes("chicken") ||
      lower.includes("mutton") ||
      lower.includes("fish") ||
      lower.includes("egg") ||
      lower.includes("non-veg") ||
      lower.includes("beef") ||
      lower.includes("pork")
    )
  }

  const filteredProducts = productsData?.products?.filter((product) => {
    if (vegFilter === null) return true
    const isVeg = isVegProduct(product.name, product.category)
    return vegFilter ? isVeg : !isVeg
  })

  const displayedProducts = React.useMemo(() => {
    if (selectedCategory === "Hot Selling") {
      let list = featuredProducts || []
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase()
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            (p.description && p.description.toLowerCase().includes(lowerSearch))
        )
      }
      if (vegFilter !== null) {
        list = list.filter((p) => {
          const isVeg = isVegProduct(p.name, p.category)
          return vegFilter ? isVeg : !isVeg
        })
      }
      return list
    } else {
      return filteredProducts || []
    }
  }, [selectedCategory, featuredProducts, filteredProducts, searchTerm, vegFilter])

  const isMenuLoading = selectedCategory === "Hot Selling" ? isFeaturedLoading : isLoading;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Search Section */}
      <section className="space-y-4">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-background mb-1">
            Explore the Menu
          </h2>
          <p className="text-on-surface-variant text-xs md:text-sm">
            Freshly prepared, packed hot, delivered fast.
          </p>
        </div>

        <div className="relative w-full max-w-2xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for pizza, burger, rolls, drinks..."
            className="w-full pl-12 pr-6 py-4 rounded-full border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50 text-sm"
          />
        </div>


      </section>

      {/* Filters Section */}
      <section className="space-y-4">
        {/* Row 1: Category Chips */}
        <div className="overflow-x-auto hide-scrollbar -mx-6 px-6">
          <div className="flex items-center gap-3 min-w-max pb-1">
            <button
              onClick={() => setSelectedCategory("Hot Selling")}
              className={`px-4 py-2 rounded-full border font-bold text-xs transition-colors ${
                selectedCategory === "Hot Selling"
                  ? "border-primary bg-primary text-white"
                  : "border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              Hot Selling
            </button>

            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full border font-bold text-xs transition-colors ${
                selectedCategory === null
                  ? "border-primary bg-primary text-white"
                  : "border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              All Items
            </button>

            {categories?.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full border font-bold text-xs transition-colors capitalize ${
                  selectedCategory === cat
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Veg/Non-Veg Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVegFilter(vegFilter === true ? null : true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border font-bold text-xs transition-colors ${
              vegFilter === true
                ? "border-primary bg-primary text-white"
                : "border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {vegFilter === true && <Check className="w-3.5 h-3.5" />}
            Veg
          </button>

          <button
            onClick={() => setVegFilter(vegFilter === false ? null : false)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border font-bold text-xs transition-colors ${
              vegFilter === false
                ? "border-primary bg-primary text-white"
                : "border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {vegFilter === false && <Check className="w-3.5 h-3.5" />}
            Non-Veg
          </button>
        </div>
      </section>

      {/* Grid Section */}
      {isMenuLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : displayedProducts && displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <FoodCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/20">
          <p className="text-on-surface-variant text-sm font-semibold">No items match your filters.</p>
          <button
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("Hot Selling")
              setVegFilter(null)
            }}
            className="text-primary font-bold hover:underline text-xs mt-2"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
