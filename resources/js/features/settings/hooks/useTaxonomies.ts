import {useCallback, useEffect, useMemo, useState} from "react";

import {
    defaultModuleGradeBands,
    defaultModuleSubjects,
    defaultStudentDiagnoses,
    defaultStudentEvaluations,
} from "@/features/settings/constants.ts";
import {settingsApi, type TaxonomyKey} from "@/features/settings/services/settingsApi.ts";

type TaxonomyState = {
    diagnoses: string[];
    evaluations: string[];
    subjects: string[];
    gradeBands: string[];
};

export const useTaxonomies = () => {
    const [taxonomies, setTaxonomies] = useState<TaxonomyState>({
        diagnoses: defaultStudentDiagnoses,
        evaluations: defaultStudentEvaluations,
        subjects: defaultModuleSubjects,
        gradeBands: defaultModuleGradeBands,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mapFromApi = (key: TaxonomyKey) => {
        switch (key) {
            case "student_diagnoses":
                return "diagnoses";
            case "student_evaluations":
                return "evaluations";
            case "module_subjects":
                return "subjects";
            case "module_grade_bands":
                return "gradeBands";
            default:
                return undefined;
        }
    };

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await settingsApi.fetchTaxonomies();
            const items = Array.isArray(response) ? response : [];
            setTaxonomies((prev) => {
                const next = {...prev};
                items.forEach((taxonomy) => {
                    const key = mapFromApi(taxonomy.key);
                    if (!key) {
                        return;
                    }
                    next[key] = taxonomy.options ?? [];
                });
                return next;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load taxonomies.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load().then(() => {});
    }, [load]);

    const options = useMemo(() => taxonomies, [taxonomies]);

    return {
        ...options,
        isLoading,
        error,
        reload: load,
    };
};
