"use client";
import { useFavorites } from "@/contexts/FavoritesContext";
import FavItem from "@/components/cart/FavItem";


const FavoritesPage = () => {
    const { favorites, setFavorites, refreshFavorites, addToFavorites, removeFromFavorites, favoritesCount, fetchFavorites } = useFavorites();

    return (
        <div className="inner-section">
            <h1>Favorites</h1>
            {favorites.length === 0 ? (
                <p>No favorites found</p>
            ) : (
                <ul>
                    {favorites.map((favorite) => (
                        <FavItem
                            key={favorite._id || favorite.productId}
                            item={favorite}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FavoritesPage;