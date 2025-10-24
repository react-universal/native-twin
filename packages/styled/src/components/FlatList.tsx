import type { ReactNode } from 'react';
import { type FlatListProps, FlatList as RNFlatList } from 'react-native';

import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

const mapping: StylableComponentConfigOptions<typeof RNFlatList> = {
  ListFooterComponentClassName: 'ListFooterComponentStyle',
  ListHeaderComponentClassName: 'ListHeaderComponentStyle',
  columnWrapperClassName: 'columnWrapperStyle',
  contentContainerClassName: 'contentContainerStyle',
};

export const FlatList = copyComponentProperties(
  RNFlatList,
  <ItemT,>(props: FlatListProps<ItemT>) => {
    const config = getNormalizeConfig(mapping);
    // FIXME: accurate extractor for lambda types
    return useStyledComponent(RNFlatList, props as any, config);
  },
) as unknown as typeof RNFlatList & (<ItemT>(props: FlatListProps<ItemT>) => ReactNode);

export default FlatList;
