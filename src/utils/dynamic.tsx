import React, { ComponentType, lazy, Suspense } from 'react';

export interface DynamicOptions<P = {}> {
  ssr?: boolean;
  loading?: (props: { error?: Error | null; isLoading?: boolean; pastDelay?: boolean; retry?: () => void }) => React.ReactNode;
}

export function dynamic<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P> | any>,
  options: DynamicOptions<P> = {}
): ComponentType<P> {
  const LazyComponent = lazy(async () => {
    const mod = await loader();
    if (mod && mod.default) {
      return { default: mod.default };
    }
    if (typeof mod === 'function') {
      return { default: mod };
    }
    // If named export was returned, find the first component
    const comp = Object.values(mod).find((val) => typeof val === 'function') as ComponentType<P>;
    return { default: comp || (() => null) };
  });

  return function DynamicWrapper(props: P) {
    const fallback = options.loading ? options.loading({ isLoading: true }) : null;
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export default dynamic;
