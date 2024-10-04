import { ClassToRenderer } from '@/feactures/docs/layout/ClassToRederer';
import { HeaderDocsTop } from '@/feactures/docs/layout/HeaderDocsTop';
import tailwindClasses from '../../../../data';
import { dataBackground, dataShadowAndIndex } from './dataColors';

export default function ColorsBackgroundPage() {
  return (
    <div className='flex flex-col gap-10'>
      <HeaderDocsTop
        title='Background and Border'
        Data={tailwindClasses.colorsBackground.background}
        id='background'
      ></HeaderDocsTop>
      <ClassToRenderer list={dataBackground} />
      <HeaderDocsTop
        title='Shadows and Z-index'
        id='shadowZIndex'
        Data={tailwindClasses.colorsBackground.shadowZIndex}
      ></HeaderDocsTop>
      <ClassToRenderer list={dataShadowAndIndex} />
    </div>
  );
}
