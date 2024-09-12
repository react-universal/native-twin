import tailwindClasses, { TailwindClass, tailwindGlossary } from "../../data";

export interface TailwindClassResult {
  class: string;
  web: boolean;
  native: boolean;
  route: string;
}

export function searchTailwindClasses(query: string): TailwindClassResult[] {
  const results: TailwindClassResult[] = [];


  Object.entries(tailwindClasses).forEach(([categoryKey, category]) => {
    const glossaryCategory = tailwindGlossary[categoryKey as keyof typeof tailwindGlossary]; // Verificamos que exista en el glosario

    if (glossaryCategory) {
   
      Object.entries(category).forEach(([subCategoryKey, subCategory]) => {
       
        subCategory.forEach((twClass: TailwindClass) => {
        
          if (twClass.class.includes(query)) {
           
            const glossarySubCategory = glossaryCategory.categories.find(
              (cat) => cat.route.includes(subCategoryKey)
            );

            if (glossarySubCategory) {
           
              results.push({
                class: twClass.class,
                web: twClass.web,
                native: twClass.native,
                route: glossarySubCategory.route,
              });
            }
          }
        });
      });
    }
  });

  return results;
}

