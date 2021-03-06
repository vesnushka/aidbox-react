import { useState } from 'react';

import { AidboxResource, Bundle } from 'src/contrib/aidbox';
import { isSuccess, RemoteData } from '../libs/remoteData';
import { getFHIRResources } from '../services/fhir';
import { SearchParams } from '../services/search';
import { useService } from './service';

export interface PagerManager {
    loadNext: () => void;
    reload: () => void;
    hasNext: boolean;
}

export function usePager<T extends AidboxResource>(
    resourceType: T['resourceType'],
    resourcesOnPage: number = 15,
    searchParams: SearchParams = {}
): [RemoteData<Bundle<T>>, PagerManager] {
    const [pageToLoad, setPageToLoad] = useState(1);
    const [reloadsCount, setReloadsCount] = useState(0);

    const [resources] = useService(
        () =>
            getFHIRResources(resourceType, {
                ...searchParams,
                _count: resourcesOnPage,
                _page: pageToLoad,
            }),
        [pageToLoad, reloadsCount]
    );

    return [
        resources,
        {
            loadNext: () => setPageToLoad((currentPage) => currentPage + 1),
            hasNext:
                isSuccess(resources) &&
                Boolean(resources.data.link && resources.data.link.some((link) => link.relation === 'next')),
            reload: () => {
                setPageToLoad(1);
                setReloadsCount((c) => c + 1);
            },
        },
    ];
}
