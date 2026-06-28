import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Check,
  X,
  RefreshCw,
  FolderOpen,
  Filter,
} from "lucide-react"
import { adminService } from "../../services/admin.service"
import { Pagination } from "../../components/admin/Pagination"
import { EmptyState } from "../../components/admin/EmptyState"
import { ConfirmDialog } from "../../components/admin/ConfirmDialog"
import { SearchBar } from "../../components/admin/SearchBar"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"

export const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Confirm dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: adminService.getCategories,
  })

  // Fetch products
  const { data: productsData, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["adminProducts", selectedCategory, currentPage, searchQuery],
    queryFn: () =>
      adminService.getAllProducts({
        search: searchQuery || undefined,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        page: currentPage,
        limit: 10,
      }),
  })

  // Toggle availability mutation
  const toggleMutation = useMutation({
    mutationFn: adminService.toggleAvailability,
    onSuccess: (updatedProduct) => {
      toast.success(
        `"${updatedProduct.name}" is now ${updatedProduct.available ? "available" : "unavailable"}`
      )
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update product availability")
    },
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully")
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] })
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete product")
      setDeleteId(null)
    },
  })

  const handleToggleAvailability = (id: string) => {
    toggleMutation.mutate(id)
  }

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId)
    }
  }

  const products = productsData?.products || []
  const totalPages = productsData?.pagination?.pages || 1

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Menu Items</h1>
          <p className="text-sm text-on-surface-variant">Add, edit, or remove products from the shop</p>
        </div>
        <Link to="/admin/products/new" className="self-start sm:self-auto">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Filtering and Search Controls */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="w-full md:max-w-xs">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder="Search products..."
          />
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter Category:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
            className="text-xs font-bold border border-outline-variant/30 bg-surface-container rounded-xl px-3 py-2 focus:outline-none focus:border-primary text-on-surface"
          >
            <option value="all">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products table list */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface-container rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState
              title="No Products Found"
              description="Click 'Add New Product' to start building your menu."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/10">
                <thead>
                  <tr className="text-left text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                    <th className="py-3 px-4">Product Info</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm text-on-surface">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-surface-container/30 transition-colors align-middle">
                      {/* Image & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant/10 overflow-hidden shrink-0">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-outline" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-on-surface">{product.name}</h4>
                            <p className="text-xs text-on-surface-variant max-w-xs truncate">
                              {product.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-xs text-on-surface-variant">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-extrabold text-sm text-primary">
                        ₹{product.price}
                      </td>

                      {/* Availability toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleAvailability(product._id)}
                          disabled={toggleMutation.isPending}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase transition-all ${
                            product.available
                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                          }`}
                        >
                          {product.available ? (
                            <>
                              <Check className="w-3 h-3" /> Available
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" /> Out of stock
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/${product._id}/edit`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(product._id)}
                            className="h-8 w-8 text-on-surface-variant hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-outline-variant/10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description="Are you absolutely sure you want to delete this product? This action cannot be undone and the product will be permanently removed from the menu."
      />
    </div>
  )
}
