'use client';

import { useState } from 'react';
import { SearchButton } from '@/components/SearchButton';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import Link from 'next/link';
import { TAILWIND_GLOSSARY } from '../../../data';

export default function DocsPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showDrawer, setShowDrawer] = useState(false);
  const handlerToggle = () => setShowDrawer(!showDrawer);
  return (
    <section className='py-[0px]  gap-5'>
      <div className=' col-span-3'>
        <Drawer direction='left' open={showDrawer} onOpenChange={setShowDrawer}>
          <DrawerTrigger className='bg-purple-500 p-4 rounded-md fixed right-4 bottom-4'>
            Menu
          </DrawerTrigger>
          <DrawerContent className='p-4 flex flex-col gap-2'>
            <DrawerClose className='w-full p-4 bg-purple-500 text-[24px] min-h-[54px] text-center'>
              Exit
            </DrawerClose>
            <SearchButton></SearchButton>
            <div className='grid grid-cols-2 lg:grid-cols-4'>
              {Object.entries(TAILWIND_GLOSSARY).map(([key, item]) => {
                return (
                  <div className='mb-2' key={key}>
                    {/* Título principal de cada tema */}
                    <h3 className=' flex flex-col text-[24px] text-white'>
                      {item.title.split(' ').map((item) => {
                        return <span> {item} </span>;
                      })}
                    </h3>
                    <ul>
                      {item.categories.map((category, index) => (
                        <li key={index} onClick={handlerToggle}>
                          {/* Nombre de la categoría con la ruta correspondiente */}
                          <Link href={'/documentation/' + category.route}>
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>
        {children}
      </div>
    </section>
  );
}
