import {useCallback, useEffect, useState} from "react";
import {fetchModule} from "../services/moduleApi";
import type {ModuleDetail} from "../types/module";

export function useModule(moduleId?: string) {
    const [module, setModule] = useState<ModuleDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    const load = useCallback(async () => {
        if (!moduleId) {
            setError("Module ID missing from the route.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchModule(moduleId);
            setModule(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load module.");
            setModule(null);
        } finally {
            setIsLoading(false);
        }
    }, [moduleId, refreshIndex]);

    useEffect(() => {
        load().then(() => {});
    }, [load]);

    return {
        module,
        isLoading,
        error,
        reload: () => setRefreshIndex((prev) => prev + 1),
    };
}
