import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  isIngredientUrl,
  type MarkdownIngredient,
  prepareRecipeMarkdown,
} from "@/lib/markdown/parser";

export function RecipeMarkdown({
  markdown,
  ingredients,
  divisor,
}: {
  markdown: string;
  ingredients: MarkdownIngredient[];
  divisor: number;
}) {
  const preparedMarkdown = prepareRecipeMarkdown(
    markdown,
    ingredients,
    divisor,
  );

  return (
    <div className="instruction-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) =>
          isIngredientUrl(url) ? url : defaultUrlTransform(url)
        }
        components={{
          a({ href, children }) {
            if (isIngredientUrl(href)) {
              return <span className="ingredient-reference">{children}</span>;
            }

            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {preparedMarkdown}
      </Markdown>
    </div>
  );
}
