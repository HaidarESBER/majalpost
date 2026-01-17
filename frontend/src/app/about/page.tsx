import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "عن مجال بوست",
  description: "منصة إعلامية لبنانية مستقلة تركز على قضايا البيئة، الاقتصاد، والمجتمع",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold md:text-5xl">عن مجال بوست</h1>
          <p className="text-xl text-gray-600 md:text-2xl">
            منصة إعلامية لبنانية مستقلة
          </p>
        </div>

        {/* Vision Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold md:text-3xl border-b-2 border-gray-200 pb-3">
            الرؤية
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              نسعى في مجال بوست إلى أن نكون منصة إعلامية رائدة في لبنان، تركّز على
              القضايا البيئية والاقتصادية والاجتماعية التي تهم المواطن اللبناني،
              بعيداً عن الضجيج السياسي والتحيزات الحزبية.
            </p>
            <p>
              نؤمن بأن الصحافة المستقلة والمهنية هي الأساس لفهم أعمق للتحديات
              والفرص في لبنان، ونسعى إلى تقديم محتوى يخاطب العقل والوجدان معاً،
              بصيغة واضحة ومفهومة تمكن القراء من بناء آراء مستنيرة.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold md:text-3xl border-b-2 border-gray-200 pb-3">
            الرسالة
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              مهمتنا هي تقديم صحافة بيئية واقتصادية واجتماعية عالية الجودة، تركز
              على القضايا التي تؤثر بشكل مباشر على حياة المواطن اللبناني. نعمل
              على:
            </p>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>
                تغطية القضايا البيئية والمناخية بشكل شامل ومهني، مع التركيز على
                الحلول والمبادرات المحلية
              </li>
              <li>
                متابعة التطورات الاقتصادية والمعيشية التي تؤثر على حياة الناس
                اليومية
              </li>
              <li>
                تسليط الضوء على القضايا الاجتماعية والتربوية والصحية التي تهم
                المجتمع اللبناني
              </li>
              <li>
                تقديم المحتوى بصيغة واضحة ومفهومة، تجعل القضايا المعقدة في متناول
                الجميع
              </li>
            </ul>
          </div>
        </section>

        {/* Values Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold md:text-3xl border-b-2 border-gray-200 pb-3">
            القيم
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">الاستقلالية</h3>
              <p className="text-gray-700 leading-relaxed">
                نحافظ على استقلاليتنا التحريرية، ونتجنب أي تأثيرات سياسية أو
                تجارية على محتوانا.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">الجودة</h3>
              <p className="text-gray-700 leading-relaxed">
                نلتزم بأعلى معايير الصحافة المهنية، من حيث الدقة والموضوعية
                والتحقق من المعلومات.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">التركيز البيئي</h3>
              <p className="text-gray-700 leading-relaxed">
                القضايا البيئية والمناخية هي في صلب اهتمامنا، ونعطيها أولوية خاصة
                في تغطيتنا.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">الشفافية</h3>
              <p className="text-gray-700 leading-relaxed">
                نؤمن بالشفافية في عملنا، ونقدم معلومات واضحة عن مصادرنا ونهجنا
                التحريري.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <h3 className="text-xl font-bold mb-3">تواصل معنا</h3>
          <p className="text-gray-600 mb-4">
            لديك سؤال أو اقتراح؟ نود أن نسمع منك
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            اتصل بنا
          </a>
        </section>
      </div>
    </div>
  );
}

