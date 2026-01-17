export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <main className="w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">
            مجال بوست
          </h1>
          <p className="text-xl text-gray-600 md:text-2xl">
            منصة إعلامية لبنانية مستقلة
          </p>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500">
            صحافة بيئية واقتصادية واجتماعية تركز على القضايا المهمة للمواطن اللبناني،
            بعيداً عن الضجيج السياسي، نحو فهم أعمق للتحديات والفرص.
          </p>
        </div>

        {/* Category Preview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CategoryCard
            name="البيئة والمناخ"
            description="ثروة طبيعية، زراعة وأرض، طاقة واستدامة"
            color="var(--color-environment)"
          />
          <CategoryCard
            name="شؤون الناس"
            description="قضايا المجتمع والحياة اليومية"
            color="var(--color-society)"
          />
          <CategoryCard
            name="اقتصاد ومعيشة"
            description="الأخبار الاقتصادية وتأثيرها على المعيشة"
            color="var(--color-economy)"
          />
          <CategoryCard
            name="تربية وتعليم"
            description="التعليم والشباب والمستقبل"
            color="var(--color-education)"
          />
          <CategoryCard
            name="تكنولوجيا وابتكار"
            description="التقنية والابتكار في لبنان والعالم"
            color="var(--color-tech)"
          />
          <CategoryCard
            name="صحة وحياة"
            description="الصحة العامة وأسلوب الحياة"
            color="var(--color-health)"
          />
        </div>

        {/* Footer placeholder */}
        <footer className="pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} مجال بوست - جميع الحقوق محفوظة</p>
        </footer>
      </main>
    </div>
  );
}

function CategoryCard({
  name,
  description,
  color,
}: {
  name: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
      style={{ borderRightWidth: "4px", borderRightColor: color }}
    >
      <h3 className="mb-2 text-lg font-bold">{name}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
