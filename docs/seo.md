# SEO: Brain Weight Prediction

Site: https://brain.miracdeprem.com (TR `/`, EN `/en/`)

## Keywords

The aim is that someone looking for what this tool does finds it. General terms are competitive; longer, specific phrases are where a small site can rank.

### Turkish
| Type | Phrases |
|---|---|
| General | beyin ağırlığı, beyin ağırlığı hesaplama, ortalama beyin ağırlığı, insan beyni kaç gram |
| Specific | baş hacminden beyin ağırlığı hesaplama, baş hacmi beyin ağırlığı ilişkisi, kafa hacmi ile beyin ağırlığı, beyin ağırlığı tahmini |
| Data / ML | doğrusal regresyon örneği, regresyon tahmin aralığı, çapraz doğrulama örneği, makine öğrenmesi regresyon projesi |

### English
| Type | Phrases |
|---|---|
| General | brain weight, brain weight calculator, average human brain weight |
| Specific | head size to brain weight, brain weight from head size, head size brain weight regression, predict brain weight |
| Data / ML | head brain dataset, Gladstone 1905 dataset, linear regression prediction interval, cross validation model comparison example |

## Where they are used

- `<title>` and meta description of each page (natural sentences, no keyword lists)
- One `h1` per page: "Baş hacminden beyin ağırlığı tahmini" / "Predict brain weight from head size"
- Open Graph and Twitter card with a 1200×630 image per language
- JSON-LD: `WebApplication` (calculator) and `TechArticle` (model page), dataset source as `ScholarlyArticle`
- `hreflang` tr / en / x-default, canonical on every page, `sitemap.xml` with alternates, `robots.txt`
- GitHub: repository description, topics and the first paragraph of the README
- Portfolio project page `/projects/beyin-agirligi-tahmini`

## Google Search Console

1. Add a **URL prefix** property for `https://brain.miracdeprem.com/` (or use the existing `miracdeprem.com` domain property if there is one; subdomains are covered by it).
2. Submit `https://brain.miracdeprem.com/sitemap.xml` under **Sitemaps**.
3. Use **URL inspection** on `/` and `/en/` and request indexing.
