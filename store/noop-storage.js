// No-op storage for server-side rendering
// This prevents localStorage access during SSR

const createNoopStorage = () => {
    return {
        getItem: (_key) => Promise.resolve(null),
        setItem: (_key, value) => Promise.resolve(value),
        removeItem: (_key) => Promise.resolve(),
    }
}

export default createNoopStorage()
