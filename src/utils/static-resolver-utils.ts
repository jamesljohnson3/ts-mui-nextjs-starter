import path from 'path';
import * as types from 'types';

import { PageProps, AllPageLayoutProps } from '../components/layouts';

export function findPageLayouts(documents: types.DocumentTypes[]) {
    return documents.filter(isPageLayout);
}
export function findConfig(documents: types.DocumentTypes[]) {
    return documents.find(isConfig);
}

export function isPageLayout(document: types.DocumentTypes): document is types.PageLayout {
    return document.type === 'PageLayout';
}

export function isConfig(document: types.DocumentTypes): document is types.Config {
    return document.type === 'Config';
}

export function toPageProps<T extends AllPageLayoutProps>(pageLayoutProps: T, urlPath: string, documents: types.DocumentTypes[]): PageProps<T> {
    const config = findConfig(documents)!;

    return {
        site: {
            ...config,
            env: {
                ...(process?.env?.URL && { URL: process.env.URL })
            }
        },
        page: {
            ...pageLayoutProps,
            __metadata: {
                ...pageLayoutProps.__metadata,
                urlPath
            }
        } as T
    };
}

/**
 * Takes a document and returns URL path for that document.
 * The URL path is inferred from the document's filepath relative to the source
 * folder this document was loaded from.
 *
 * The return URL path is always prefixed with forward slash. If file name is
 * 'index', it is not included in the URL path.
 *
 * For example, if the source folder for page documents is content/pages, and
 * a file representing a was loaded from content/pages/company/about.md, the
 * inferred URL path will be "/company/about"
 *
 * @param document
 */
export function urlPathForDocument(document: types.DocumentTypes) {
    const relSourcePath = document.__metadata.relSourcePath;
    const pathObject = path.posix.parse(relSourcePath);
    const parts = pathObject.dir.split(path.posix.sep).filter(Boolean);
    if (pathObject.name !== 'index') {
        parts.push(pathObject.name);
    }
    const urlPath = parts.join('/').toLowerCase();
    return '/' + urlPath;
}
