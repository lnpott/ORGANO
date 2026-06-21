import { useState, useEffect, useRef } from "react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Departamento {
  id: string;
  nome: string;
  icone: string;
  tituloProcessos?: string;
  processos: string[];
}

interface ItemTransversal {
  id: string;
  icone: string;
  texto: string;
}

interface OrgData {
  titulo: string;
  noTopo: string;
  iconeTopo: string;
  departamentos: Departamento[];
  transversais: {
    titulo: string;
    subtitulo: string;
    itens: ItemTransversal[];
    iconeSecao?: string;
  };
}

// ─── Dados padrão (espelho fiel do Figma) ────────────────────────────────────

const DADOS_PADRAO: OrgData = {
  titulo: "ORGANOGRAMA E PROCESSOS POR SETOR",
  noTopo: "DIRETORIA\nGERAL",
  iconeTopo: "👤",
  departamentos: [
    {
      id: "admin",
      nome: "DIRETORIA\nADMINISTRATIVA",
      icone: "👤",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Planejamento estratégico administrativo",
        "Gestão de recursos corporativos e indicadores",
        "Políticas, normas e compliance",
        "Gestão de contratos administrativos",
        "Relatórios gerenciais e indicadores",
        "Comunicação interna e governança",
      ],
    },
    {
      id: "rh",
      nome: "RECURSOS\nHUMANOS (RH)",
      icone: "👥",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Recrutamento e seleção",
        "Admissão e integração de colaboradores",
        "Gestão de ponto, folha e benefícios",
        "Treinamentos e desenvolvimento",
        "Avaliação de desempenho",
        "Saúde, segurança e bem-estar (SSO)",
        "Relações trabalhistas e clima organizacional",
      ],
    },
    {
      id: "dp",
      nome: "DP / LOGÍSTICA",
      icone: "📋",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Administração de pessoal e folha de pagamento",
        "Obrigações trabalhistas e encargos",
        "Controle de férias e afastamentos",
        "Gestão de ASO, PCMSO e documentação legal",
        "Integração com canteiros e bases offshore",
        "Logística de transporte, viagens e hospedagem",
        "Controle de EPIs, uniformes e materiais de apoio",
      ],
    },
    {
      id: "financeiro",
      nome: "FINANCEIRO",
      icone: "💰",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Gestão contábil e fiscal",
        "Contas a pagar e a receber",
        "Conciliação bancária",
        "Gestão de fluxo de caixa",
        "Elaboração de relatórios financeiros",
        "Controle de impostos e tributos",
        "Gestão de custos e despesas",
      ],
    },
    {
      id: "projetos",
      nome: "PROJETOS",
      icone: "📁",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Levantamento de escopo e requisitos",
        "Planejamento e engenharia",
        "Desenvolvimento de documentos técnicos",
        "Compatibilização e integração de disciplinas",
        "Análise de riscos e viabilidade",
        "Emissão de desenhos, especificações e listas",
        "Acompanhamento técnico e suporte à execução",
      ],
    },
    {
      id: "orcamento",
      nome: "ORÇAMENTO",
      icone: "🧮",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Levantamento de quantitativos",
        "Composição de custos diretos e indiretos",
        "Elaboração de propostas técnico-comerciais",
        "Análise de cenários e competitividade",
        "Controle de revisões e aprovações",
        "Integração com projetos e suprimentos",
        "Acompanhamento de desvios e planejamento de custos",
      ],
    },
    {
      id: "compras",
      nome: "COMPRAS /\nSUPRIMENTOS",
      icone: "🛒",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Planejamento de compras",
        "Cotações e negociação com fornecedores",
        "Homologação e avaliação de fornecedores",
        "Emissão de pedidos de compra",
        "Acompanhamento de entregas",
        "Gestão de contratos de fornecimento",
        "Controle de qualidade, custos e prazos",
      ],
    },
    {
      id: "almoxarifado",
      nome: "ALMOXARIFADO",
      icone: "🏭",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Recebimento e conferência de materiais",
        "Armazenagem e controle de estoques",
        "Endereçamento e rastreabilidade",
        "Separação e expedição de materiais",
        "Inventários e conciliação de estoque",
        "Controle de validade e obsolescência",
        "Apoio logístico a canteiros e embarcações",
      ],
    },
  ],
  transversais: {
    titulo: "PROCESSOS TRANSVERSAIS",
    subtitulo: "(APLICÁVEIS A TODOS OS SETORES)",
    iconeSecao: "⚙️",
    itens: [
      { id: "ssma",       icone: "🛡️", texto: "Saúde, Segurança e Meio Ambiente (SSMA)" },
      { id: "compliance", icone: "⚖️", texto: "Compliance & Ética Corporativa" },
      { id: "riscos",     icone: "📊", texto: "Gestão de Riscos e Controle Interno" },
      { id: "info",       icone: "🗂️", texto: "Gestão da Informação e Documentação" },
      { id: "melhoria",   icone: "👥", texto: "Melhoria Contínua e Gestão de Indicadores" },
    ],
  },
};

// ─── Cores do design (baseadas no site Prospecta) ──────────────────────────

const C = {
  navy:       "#0A1628",
  deptBg:     "#E8EEF5",
  deptBorder: "#1E3A5F",
  linha:      "#2C5282",
  branco:     "#FFFFFF",
  fundo:      "#F7FAFC",
  accent:     "#C53030",
};

// ─── Componente: Texto Editável ───────────────────────────────────────────────
// Usa contenteditable para edição WYSIWYG.
// Sincroniza com React state apenas no blur/input para evitar conflito de cursor.

function TextoEditavel({
  valor,
  aoMudar,
  modoEdicao,
  tag: Tag = "span",
  estilo,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  modoEdicao: boolean;
  tag?: keyof JSX.IntrinsicElements;
  estilo?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const editando = useRef(false);

  // Atualiza o DOM quando o valor muda externamente (ex: importar JSON)
  useEffect(() => {
    if (!editando.current && ref.current) {
      ref.current.textContent = valor;
    }
  }, [valor]);

  // Re-popula ao entrar/sair do modo de edição
  useEffect(() => {
    if (!editando.current && ref.current) {
      ref.current.textContent = valor;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoEdicao]);

  const estiloEdicao: React.CSSProperties = modoEdicao
    ? { cursor: "text", minWidth: "1em" }
    : {};

  return (
    <Tag
      // @ts-expect-error: ref tipagem genérica
      ref={ref}
      contentEditable={modoEdicao}
      suppressContentEditableWarning
      onFocus={() => { editando.current = true; }}
      onBlur={() => {
        editando.current = false;
        if (ref.current) aoMudar(ref.current.textContent ?? "");
      }}
      onInput={() => {
        if (ref.current) aoMudar(ref.current.textContent ?? "");
      }}
      style={{ ...estilo, ...estiloEdicao }}
    />
  );
}

// ─── App Principal ────────────────────────────────────────────────────────────

export default function App() {
  const [modoEdicao, setModoEdicao] = useState(true);

  // Carrega do localStorage ou usa os dados padrão
  const [dados, setDados] = useState<OrgData>(() => {
    try {
      const salvo = localStorage.getItem("organograma-v1");
      return salvo ? (JSON.parse(salvo) as OrgData) : DADOS_PADRAO;
    } catch {
      return DADOS_PADRAO;
    }
  });

  // Salva automaticamente a cada mudança
  useEffect(() => {
    localStorage.setItem("organograma-v1", JSON.stringify(dados));
  }, [dados]);

  // ─── Funções de atualização de estado ───

  const setTitulo        = (v: string) => setDados(d => ({ ...d, titulo: v }));
  const setNoTopo        = (v: string) => setDados(d => ({ ...d, noTopo: v }));

  const setNomeDept = (id: string, v: string) =>
    setDados(d => ({
      ...d,
      departamentos: d.departamentos.map(dep =>
        dep.id === id ? { ...dep, nome: v } : dep
      ),
    }));

  const setProcesso = (deptId: string, idx: number, v: string) =>
    setDados(d => ({
      ...d,
      departamentos: d.departamentos.map(dep =>
        dep.id === deptId
          ? { ...dep, processos: dep.processos.map((p, i) => (i === idx ? v : p)) }
          : dep
      ),
    }));

  const setTransvTitulo    = (v: string) => setDados(d => ({ ...d, transversais: { ...d.transversais, titulo: v } }));
  const setTransvSubtitulo = (v: string) => setDados(d => ({ ...d, transversais: { ...d.transversais, subtitulo: v } }));

  const setTransvItem = (id: string, v: string) =>
    setDados(d => ({
      ...d,
      transversais: {
        ...d.transversais,
        itens: d.transversais.itens.map(it => (it.id === id ? { ...it, texto: v } : it)),
      },
    }));

  const setIconeDept = (id: string, v: string) =>
    setDados((d: OrgData) => ({
      ...d,
      departamentos: d.departamentos.map((dep: Departamento) =>
        dep.id === id ? { ...dep, icone: v } : dep
      ),
    }));

  const setIconeTopo = (v: string) => setDados((d: OrgData) => ({ ...d, iconeTopo: v }));

  const setIconeTransv = (id: string, v: string) =>
    setDados((d: OrgData) => ({
      ...d,
      transversais: {
        ...d.transversais,
        itens: d.transversais.itens.map((it: ItemTransversal) => (it.id === id ? { ...it, icone: v } : it)),
      },
    }));

  const setIconeTransvSecao = (v: string) =>
    setDados((d: OrgData) => ({
      ...d,
      transversais: {
        ...d.transversais,
        iconeSecao: v,
      },
    }));

  const setTituloProcessos = (deptId: string, v: string) =>
    setDados((d: OrgData) => ({
      ...d,
      departamentos: d.departamentos.map((dep: Departamento) =>
        dep.id === deptId ? { ...dep, tituloProcessos: v } : dep
      ),
    }));

  // ─── Exportar JSON ───

  const exportarJSON = () => {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "organograma.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Importar JSON ───

  const importarJSON = () => {
    const input   = document.createElement("input");
    input.type    = "file";
    input.accept  = ".json";
    input.onchange = (e) => {
      const arquivo = (e.target as HTMLInputElement).files?.[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = (ev) => {
        try {
          setDados(JSON.parse(ev.target?.result as string) as OrgData);
        } catch {
          alert("Arquivo JSON inválido.");
        }
      };
      leitor.readAsText(arquivo);
    };
    input.click();
  };

  // ─── Cálculos para o SVG conector ───
  // Cada departamento ocupa 100 unidades no viewBox.
  // Centro da coluna i → i * 100 + 50.
  // preserveAspectRatio="none" escala para 100% do container.
  // vectorEffect="non-scaling-stroke" mantém espessura uniforme.

  const N    = dados.departamentos.length;
  const svgW = N * 100;

  return (
    <>
      <style>{`
        /* Estado de edição: borda tracejada âmbar nos campos ativos */
        [contenteditable="true"]:focus {
          outline: 2px dashed #f59e0b !important;
          background: rgba(254, 243, 199, 0.55) !important;
          border-radius: 2px;
        }
        [contenteditable="true"] {
          outline: 1px dashed rgba(245, 158, 11, 0.35);
          border-radius: 2px;
        }

        /* Botões da toolbar */
        .btn-tool {
          background: rgba(255,255,255,0.13);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 6px;
          padding: 6px 13px;
          cursor: pointer;
          font-family: 'Roboto', sans-serif;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.14s;
          white-space: nowrap;
        }
        .btn-tool:hover   { background: rgba(255,255,255,0.24); }
        .btn-tool.ativo   { background: #f59e0b; color: #1a1100; border-color: #f59e0b; }
        .btn-tool.ativo:hover { background: #fbbf24; }

        /* Responsivo: tablet */
        @media (max-width: 960px) {
          .org-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .svg-conector { display: none !important; }
          .linha-v-topo { display: none !important; }
        }
        /* Responsivo: mobile */
        @media (max-width: 560px) {
          .org-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .transv-itens { flex-direction: column !important; }
        }
        /* Ocultar toolbar na impressão */
        @media print {
          .toolbar { display: none !important; }
        }
      `}</style>

      <div style={{ background: C.fundo, minHeight: "100vh", fontFamily: "'Roboto', sans-serif" }}>

        {/* ══ BARRA DE FERRAMENTAS ══════════════════════════════════════════ */}
        <div
          className="toolbar"
          style={{
            position: "sticky", top: 0, zIndex: 60,
            background: C.navy,
            padding: "12px 24px",
            display: "flex", alignItems: "center", gap: 16,
            flexWrap: "wrap",
            boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}
        >
          {/* Logo Prospecta */}
          <img
            src="/prospecta-logo.jpeg"
            alt="Prospecta Logo"
            style={{
              height: 40,
              width: "auto",
              objectFit: "contain",
            }}
          />

          <span style={{ color: "#fff", fontWeight: 900, fontSize: 13, marginRight: 6, letterSpacing: "0.03em" }}>
            📊 Organograma Editor
          </span>

          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button className="btn-tool" onClick={exportarJSON} aria-label="Exportar JSON">
              📥 Exportar JSON
            </button>
            <button className="btn-tool" onClick={importarJSON} aria-label="Importar JSON">
              📤 Importar JSON
            </button>
          </div>

          <span style={{ color: "#fcd34d", fontSize: 11, fontStyle: "italic" }}>
            ✏️ Clique em qualquer texto para editar — salvo automaticamente
          </span>
        </div>

        {/* ══ CONTEÚDO PRINCIPAL ═══════════════════════════════════════════ */}
        <main
          style={{ maxWidth: 1600, margin: "0 auto", padding: "32px 24px 60px" }}
          role="main"
          aria-label="Organograma e processos por setor"
        >

          {/* Título principal */}
          <header style={{ textAlign: "center", marginBottom: 28 }}>
            <TextoEditavel
              valor={dados.titulo}
              aoMudar={setTitulo}
              modoEdicao={modoEdicao}
              tag="h1"
              estilo={{
                fontSize: "clamp(18px, 2.2vw, 26px)",
                fontWeight: 900,
                color: C.navy,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                display: "inline-block",
                lineHeight: 1.3,
              }}
            />
          </header>

          {/* ── Árvore do organograma ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Nó topo: Diretoria Geral */}
            <div
              role="region"
              aria-label="Diretoria Geral"
              style={{
                background: C.navy, color: "#fff",
                borderRadius: 10, padding: "12px 36px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                minWidth: 160,
                boxShadow: "0 4px 14px rgba(30,43,110,0.35)",
              }}
            >
              <TextoEditavel
                valor={dados.iconeTopo}
                aoMudar={setIconeTopo}
                modoEdicao={modoEdicao}
                tag="span"
                estilo={{ fontSize: 26, display: "block", textAlign: "center" }}
              />
              <TextoEditavel
                valor={dados.noTopo}
                aoMudar={setNoTopo}
                modoEdicao={modoEdicao}
                tag="span"
                estilo={{
                  fontSize: 15, fontWeight: 900, textAlign: "center",
                  whiteSpace: "pre-line", display: "block", letterSpacing: "0.06em",
                }}
              />
            </div>

            {/* Linha vertical do nó topo até o SVG conector */}
            <div
              className="linha-v-topo"
              style={{ width: 2, height: 16, background: C.linha, flexShrink: 0 }}
              aria-hidden="true"
            />

            {/* SVG: linha horizontal + descidas verticais para cada departamento */}
            {/* Funciona porque gap=0 no grid abaixo → colunas perfeitamente simétricas */}
            <svg
              className="svg-conector"
              width="100%"
              height={28}
              viewBox={`0 0 ${svgW} 28`}
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ display: "block" }}
            >
              {/* Barra horizontal */}
              <line
                x1={50} y1={2} x2={svgW - 50} y2={2}
                stroke={C.linha} strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Descidas para cada coluna */}
              {dados.departamentos.map((_, i) => (
                <line
                  key={i}
                  x1={i * 100 + 50} y1={2}
                  x2={i * 100 + 50} y2={28}
                  stroke={C.linha} strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* ── Grade de departamentos ── */}
            {/* gap=0 é intencional para que o SVG acima alinhe perfeitamente */}
            <div
              className="org-grid"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${N}, 1fr)`,
                gap: 0,
                width: "100%",
                alignItems: "start",
              }}
            >
              {dados.departamentos.map((dept) => (
                <article
                  key={dept.id}
                  aria-label={`Departamento: ${dept.nome.replace("\n", " ")}`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "0 4px",
                  }}
                >
                  {/* Caixa do departamento */}
                  <div style={{
                    background: C.deptBg,
                    border: `2px solid ${C.deptBorder}`,
                    borderRadius: 10,
                    padding: "12px 6px 8px",
                    width: "100%",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    minHeight: 90, boxSizing: "border-box",
                  }}>
                    <TextoEditavel
                      valor={dept.icone}
                      aoMudar={(v) => setIconeDept(dept.id, v)}
                      modoEdicao={modoEdicao}
                      tag="span"
                      estilo={{ fontSize: 18, lineHeight: 1, display: "block", textAlign: "center" }}
                    />
                    <TextoEditavel
                      valor={dept.nome}
                      aoMudar={(v) => setNomeDept(dept.id, v)}
                      modoEdicao={modoEdicao}
                      tag="span"
                      estilo={{
                        fontSize: "clamp(9px, 0.85vw, 12px)",
                        fontWeight: 900, color: C.navy,
                        textAlign: "center", textTransform: "uppercase",
                        letterSpacing: "0.03em", whiteSpace: "pre-line",
                        display: "block", lineHeight: 1.3,
                      }}
                    />
                  </div>

                  {/* Linha vertical para processos */}
                  <div
                    aria-hidden="true"
                    style={{ width: 2, height: 10, background: C.linha, flexShrink: 0 }}
                  />

                  {/* Caixa de processos */}
                  <section
                    aria-label={`Processos de ${dept.nome.replace("\n", " ")}`}
                    style={{
                      background: C.branco,
                      border: `1.5px solid ${C.deptBorder}`,
                      borderRadius: 8,
                      padding: "10px 8px 12px",
                      width: "100%", flex: 1,
                      boxSizing: "border-box",
                    }}
                  >
                    <TextoEditavel
                      valor={dept.tituloProcessos || "PROCESSOS"}
                      aoMudar={(v) => setTituloProcessos(dept.id, v)}
                      modoEdicao={modoEdicao}
                      tag="h2"
                      estilo={{
                        fontSize: "clamp(8px, 0.65vw, 10px)",
                        fontWeight: 900, color: C.navy,
                        textTransform: "uppercase", letterSpacing: "0.09em",
                        textAlign: "center",
                        paddingBottom: 5, marginBottom: 6,
                        borderBottom: `1px solid ${C.deptBorder}`,
                      }}
                    />
                    <ul style={{ margin: 0, padding: "0 0 0 13px", listStyle: "disc" }}>
                      {dept.processos.map((proc, idx) => (
                        <li key={idx} style={{
                          fontSize: "clamp(8px, 0.7vw, 10px)",
                          color: C.navy, marginBottom: 4, lineHeight: 1.4,
                        }}>
                          <TextoEditavel
                            valor={proc}
                            aoMudar={(v) => setProcesso(dept.id, idx, v)}
                            modoEdicao={modoEdicao}
                            tag="span"
                            estilo={{ display: "inline" }}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                </article>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
