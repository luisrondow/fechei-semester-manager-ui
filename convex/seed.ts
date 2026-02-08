import { mutation } from "./_generated/server";

export const seedData = mutation({
	args: {},
	handler: async (ctx) => {
		// Check if data already exists
		const existing = await ctx.db.query("semesters").first();
		if (existing) {
			return { status: "already_seeded" };
		}

		// Semester
		const semId = await ctx.db.insert("semesters", {
			userId: "user-1",
			name: "2024/25 - 1.\u00ba Semestre",
			startDate: "2024-10-05",
			endDate: "2025-02-08",
			timezone: "Europe/Lisbon",
			updatedAt: "2024-09-15T10:00:00Z",
		});

		// Subjects
		const sub1 = await ctx.db.insert("subjects", {
			semesterId: semId,
			name: "\u00c1lgebra Linear I",
			code: "21092",
			instructor: "Prof. Maria Santos",
		});

		const sub2 = await ctx.db.insert("subjects", {
			semesterId: semId,
			name: "C\u00e1lculo Diferencial e Integral I",
			code: "21093",
			instructor: "Prof. Jo\u00e3o Ferreira",
		});

		// PUC Documents
		await ctx.db.insert("pucDocuments", {
			subjectId: sub1,
			fileName: "PUC_Algebra_Linear_I_2024.pdf",
			extractedText: "Full extracted text of \u00c1lgebra Linear I PUC...",
			language: "pt",
			status: "extracted",
			version: 1,
		});

		await ctx.db.insert("pucDocuments", {
			subjectId: sub2,
			fileName: "PUC_Calculo_I_2024.pdf",
			extractedText:
				"Full extracted text of C\u00e1lculo Diferencial e Integral I PUC...",
			language: "pt",
			status: "extracted",
			version: 1,
		});

		// Subject Briefs
		await ctx.db.insert("subjectBriefs", {
			subjectId: sub1,
			generatedText:
				"## O que vai estudar\n\n\u00c1lgebra Linear I introduz os fundamentos da \u00e1lgebra linear, cobrindo matrizes, sistemas de equa\u00e7\u00f5es lineares, espa\u00e7os vetoriais e transforma\u00e7\u00f5es lineares.\n\n## Compet\u00eancias a desenvolver\n\n- Resolver sistemas de equa\u00e7\u00f5es lineares usando diferentes m\u00e9todos\n- Trabalhar com matrizes e determinantes\n- Compreender espa\u00e7os vetoriais e subespa\u00e7os\n- Aplicar transforma\u00e7\u00f5es lineares\n\n## Roteiro\n\n1. **Tema 1:** Matrizes e Sistemas de Equa\u00e7\u00f5es Lineares\n2. **Tema 2:** Determinantes\n3. **Tema 3:** Espa\u00e7os Vetoriais\n4. **Tema 4:** Transforma\u00e7\u00f5es Lineares\n5. **Tema 5:** Valores e Vetores Pr\u00f3prios",
			confidenceScore: 0.92,
		});

		await ctx.db.insert("subjectBriefs", {
			subjectId: sub2,
			generatedText:
				"## O que vai estudar\n\nC\u00e1lculo Diferencial e Integral I abrange os conceitos fundamentais de c\u00e1lculo, incluindo limites, derivadas, integrais e suas aplica\u00e7\u00f5es.\n\n## Compet\u00eancias a desenvolver\n\n- Calcular limites de fun\u00e7\u00f5es\n- Derivar fun\u00e7\u00f5es usando diferentes t\u00e9cnicas\n- Integrar fun\u00e7\u00f5es e aplicar o Teorema Fundamental do C\u00e1lculo\n- Resolver problemas de aplica\u00e7\u00e3o\n\n## Roteiro\n\n1. **Tema 1:** Limites e Continuidade\n2. **Tema 2:** Derivadas\n3. **Tema 3:** Aplica\u00e7\u00f5es das Derivadas\n4. **Tema 4:** Integrais\n5. **Tema 5:** Aplica\u00e7\u00f5es dos Integrais",
			confidenceScore: 0.89,
		});

		// Calendar Events - Álgebra Linear I
		await ctx.db.insert("calendarEvents", {
			subjectId: sub1,
			type: "study_block",
			startDate: "2024-10-05",
			endDate: "2024-10-26",
			title: "Cap\u00edtulos 1 & 2: Matrizes e Sistemas",
			description:
				"Estudo de matrizes, opera\u00e7\u00f5es com matrizes e sistemas de equa\u00e7\u00f5es lineares.",
			status: "confirmed",
			sourceExcerpt:
				"Cap\u00edtulos 1 e 2 \u2014 06 a 26 de outubro (3 semanas)",
			updatedAt: "2024-09-16T10:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub1,
			type: "study_block",
			startDate: "2024-10-27",
			endDate: "2024-11-16",
			title: "Cap\u00edtulo 3: Determinantes",
			description: "Propriedades e c\u00e1lculo de determinantes.",
			status: "confirmed",
			sourceExcerpt: "Cap\u00edtulo 3 \u2014 27 de outubro a 16 de novembro",
			updatedAt: "2024-09-16T10:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub1,
			type: "assessment",
			startDate: "2024-11-28",
			endDate: "2024-12-08",
			title: "E-f\u00f3lio A",
			description: "Avalia\u00e7\u00e3o cont\u00ednua \u2014 Temas 1-3",
			status: "confirmed",
			sourceExcerpt:
				"E-f\u00f3lio A: 28 de novembro a 08 de dezembro (per\u00edodo de submiss\u00e3o)",
			updatedAt: "2024-09-16T10:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub1,
			type: "study_block",
			startDate: "2024-11-17",
			endDate: "2024-12-14",
			title: "Cap\u00edtulos 4 & 5: Espa\u00e7os Vetoriais",
			description:
				"Espa\u00e7os vetoriais, subespa\u00e7os, bases e dimens\u00e3o.",
			status: "confirmed",
			sourceExcerpt:
				"Cap\u00edtulos 4 e 5 \u2014 17 de novembro a 14 de dezembro",
			updatedAt: "2024-09-16T10:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub1,
			type: "assessment",
			startDate: "2025-01-09",
			endDate: "2025-01-19",
			title: "E-f\u00f3lio B",
			description: "Avalia\u00e7\u00e3o cont\u00ednua \u2014 Temas 4-5",
			status: "pending",
			sourceExcerpt: "E-f\u00f3lio B: 09 a 19 de janeiro",
			updatedAt: "2024-09-16T10:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub1,
			type: "tbd",
			startDate: "2025-01-25",
			endDate: "2025-02-08",
			title: "Exame / P-f\u00f3lio",
			description:
				"Consultar p\u00e1ginas oficiais para data e hora do exame.",
			status: "pending",
			sourceExcerpt:
				"Exame presencial: consultar calend\u00e1rio oficial da UAb",
			updatedAt: "2024-09-16T10:30:00Z",
		});

		// Calendar Events - Cálculo I
		await ctx.db.insert("calendarEvents", {
			subjectId: sub2,
			type: "study_block",
			startDate: "2024-10-05",
			endDate: "2024-10-19",
			title: "Tema 1: Limites e Continuidade",
			description:
				"Conceito de limite, propriedades, limites laterais e continuidade.",
			status: "confirmed",
			sourceExcerpt: "Tema 1 \u2014 05 a 19 de outubro (2 semanas)",
			updatedAt: "2024-09-16T11:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub2,
			type: "study_block",
			startDate: "2024-10-20",
			endDate: "2024-11-09",
			title: "Tema 2: Derivadas",
			description:
				"Defini\u00e7\u00e3o de derivada, regras de deriva\u00e7\u00e3o, derivadas de fun\u00e7\u00f5es compostas.",
			status: "confirmed",
			sourceExcerpt: "Tema 2 \u2014 20 de outubro a 09 de novembro",
			updatedAt: "2024-09-16T11:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub2,
			type: "assessment",
			startDate: "2024-11-14",
			endDate: "2024-11-24",
			title: "E-f\u00f3lio A",
			description:
				"Avalia\u00e7\u00e3o cont\u00ednua \u2014 Limites e Derivadas",
			status: "confirmed",
			sourceExcerpt: "E-f\u00f3lio A: 14 a 24 de novembro",
			updatedAt: "2024-09-16T11:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub2,
			type: "study_block",
			startDate: "2024-11-10",
			endDate: "2024-12-07",
			title: "Tema 3: Aplica\u00e7\u00f5es das Derivadas",
			description:
				"Estudo de fun\u00e7\u00f5es, m\u00e1ximos, m\u00ednimos e problemas de otimiza\u00e7\u00e3o.",
			status: "confirmed",
			sourceExcerpt: "Tema 3 \u2014 10 de novembro a 07 de dezembro",
			updatedAt: "2024-09-16T11:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub2,
			type: "study_block",
			startDate: "2024-12-08",
			endDate: "2025-01-04",
			title: "Temas 4 & 5: Integrais",
			description:
				"Integral definido e indefinido, t\u00e9cnicas de integra\u00e7\u00e3o e aplica\u00e7\u00f5es.",
			status: "pending",
			sourceExcerpt: "Temas 4 e 5 \u2014 08 de dezembro a 04 de janeiro",
			updatedAt: "2024-09-16T11:30:00Z",
		});

		await ctx.db.insert("calendarEvents", {
			subjectId: sub2,
			type: "assessment",
			startDate: "2025-01-09",
			endDate: "2025-01-19",
			title: "E-f\u00f3lio B",
			description:
				"Avalia\u00e7\u00e3o cont\u00ednua \u2014 Integrais",
			status: "pending",
			sourceExcerpt: "E-f\u00f3lio B: 09 a 19 de janeiro",
			updatedAt: "2024-09-16T11:30:00Z",
		});

		// Resources
		await ctx.db.insert("resources", {
			subjectId: sub1,
			sourceType: "puc_extracted",
			resourceType: "required",
			title: "\u00c1lgebra Linear e Geometria Anal\u00edtica",
			authors: "Ana Paula Santana, Jo\u00e3o Filipe Queir\u00f3",
			notes: "Manual adotado pela UC",
			tags: [],
			pinned: true,
			updatedAt: "2024-09-16T10:30:00Z",
		});

		await ctx.db.insert("resources", {
			subjectId: sub1,
			sourceType: "puc_extracted",
			resourceType: "complementary",
			title: "Elementary Linear Algebra",
			authors: "Howard Anton",
			tags: [],
			pinned: false,
			updatedAt: "2024-09-16T10:30:00Z",
		});

		await ctx.db.insert("resources", {
			subjectId: sub2,
			sourceType: "puc_extracted",
			resourceType: "required",
			title: "C\u00e1lculo, Vol. 1",
			authors: "James Stewart",
			notes: "8.\u00aa edi\u00e7\u00e3o recomendada",
			tags: [],
			pinned: true,
			updatedAt: "2024-09-16T11:30:00Z",
		});

		await ctx.db.insert("resources", {
			subjectId: sub2,
			sourceType: "user_saved",
			resourceType: "other",
			title: "3Blue1Brown - Essence of Calculus",
			url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr",
			notes: "Excelente s\u00e9rie de v\u00eddeos sobre conceitos de c\u00e1lculo",
			tags: ["v\u00eddeo", "limites", "derivadas"],
			pinned: true,
			updatedAt: "2024-10-01T14:00:00Z",
		});

		return { status: "seeded" };
	},
});
