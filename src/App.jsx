import './App.css'
import {useEffect, useMemo, useRef, useState} from "react";

function App() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            try {
                setLoading(true);
                await new Promise((r) => setTimeout(r, 2000));

                const res = await fetch("https://dummyjson.com/products");
                if (!res.ok) throw new Error("API error");
                const data = await res.json();

                if (isMounted) setProducts(data.products || []);
            } catch (e) {
                console.error(e);
                if (isMounted) setProducts([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (loading) return;

        setSearchLoading(true);
        const t = setTimeout(() => {
            setDebouncedQuery(query);
            setSearchLoading(false);
        }, 450);

        return () => clearTimeout(t);
    }, [query, loading]);

    const filtered = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p) => (p.title || "").toLowerCase().includes(q));
    }, [products, debouncedQuery]);

    function addToCart(product) {
        setCart((prev) => {
            const exists = prev.some((x) => x.title === product.title);
            if (exists) return prev;
            return [...prev, { title: product.title, price: product.price }];
        });
    }

    function removeFromCart(title) {
        setCart((prev) => prev.filter((x) => x.title !== title));
    }

    return (
        <div className="appShell">
            <div className="containerFixed">
                <header className="topbar sticky">
                    <div className="brand">
                        <span className="logo">🛒</span>
                        <div>
                            <div className="title">Products</div>
                            <div className="subtitle">DummyJSON + React</div>
                        </div>
                    </div>

                    <div className="cartBox">
                        <div className="cartHeader">
                            Cart <span className="badge">{cart.length}</span>
                        </div>

                        {cart.length === 0 ? (
                            <div className="cartEmpty">В данный момент пусто</div>
                        ) : (
                            <ul className="cartList">
                                {cart.map((item) => (
                                    <li key={item.title} className="cartItem">
                                        <div className="cartItemInfo">
                                            <div className="cartItemTitle">{item.title}</div>
                                            <div className="cartItemPrice">${item.price}</div>
                                        </div>
                                        <button
                                            className="removeBtn"
                                            onClick={() => removeFromCart(item.title)}
                                            title="Remove"
                                        >
                                            Удалить
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </header>

                <section className="controls stickyControls">
                    <div className="searchWrap">
                        <input
                            ref={inputRef}
                            className="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by title..."
                        />

                    </div>

                    <div className="count">
                        Showing: <b>{filtered.length}</b> / {products.length}
                    </div>
                </section>

                <section className="contentArea">
                    {loading ? (
                        <div className="loaderWrap">
                            <div className="spinner" />
                            <div className="loaderText">Загружется...</div>
                        </div>
                    ) : searchLoading ? (
                        <div className="searchLoaderWrap">
                            <div className="spinner" />
                            <div className="loaderText">Загружется...</div>
                        </div>
                    ) : (
                        <>
                            {filtered.length === 0 ? (
                                <div className="emptyBox">
                                    <div className="emptyTitle">Ничего не найдено</div>
                                    <div className="emptySub">
                                        Попробуйте ввести другое название или очистить область поиска.
                                    </div>
                                </div>
                            ) : (
                                <main className="grid">
                                    {filtered.map((p) => (
                                        <article
                                            key={p.id}
                                            className="card"
                                            onClick={() => addToCart(p)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === "Enter" && addToCart(p)}
                                            title="Click to add to cart"
                                        >
                                            <img className="thumb" src={p.thumbnail} alt={p.title} />
                                            <div className="cardBody">
                                                <h3 className="cardTitle">{p.title}</h3>
                                                <p className="cardDesc">{p.description}</p>
                                                <div className="cardFooter">
                                                    <div className="price">${p.price}</div>
                                                    <div className="hint">+ Add</div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </main>
                            )}
                        </>
                    )}
                </section>

            </div>
        </div>
    );
}

export default App
