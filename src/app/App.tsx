import { useState, useEffect, useRef } from "react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Departamento {
  id: string;
  nome: string;
  icone: string;
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
  };
  rodape: string;
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
      id: "projetos",
      nome: "PROJETOS",
      icone: "📁",
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
    itens: [
      { id: "ssma",       icone: "🛡️", texto: "Saúde, Segurança e Meio Ambiente (SSMA)" },
      { id: "compliance", icone: "⚖️", texto: "Compliance & Ética Corporativa" },
      { id: "riscos",     icone: "📊", texto: "Gestão de Riscos e Controle Interno" },
      { id: "info",       icone: "🗂️", texto: "Gestão da Informação e Documentação" },
      { id: "melhoria",   icone: "👥", texto: "Melhoria Contínua e Gestão de Indicadores" },
    ],
  },
  rodape:
    "Este organograma e os processos são referências genéricas e devem ser adaptados à realidade específica da empresa e aos requisitos contratuais de cada projeto.",
};

// ─── Cores do design (extraídas da imagem do Figma) ──────────────────────────

const C = {
  navy:       "#1E2B6E",
  deptBg:     "#CBE5F5",
  deptBorder: "#6AADD5",
  linha:      "#2E4FA3",
  branco:     "#FFFFFF",
  fundo:      "#F4F7FB",
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
            padding: "8px 20px",
            display: "flex", alignItems: "center", gap: 8,
            flexWrap: "wrap",
            boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 13, marginRight: 6, letterSpacing: "0.03em" }}>
            📊 Organograma Editor
          </span>

          <button className="btn-tool" onClick={exportarJSON} aria-label="Exportar JSON">
            📥 Exportar JSON
          </button>
          <button className="btn-tool" onClick={importarJSON} aria-label="Importar JSON">
            📤 Importar JSON
          </button>

          <span style={{ color: "#fcd34d", fontSize: 11, marginLeft: "auto", fontStyle: "italic" }}>
            ✏️ Clique em qualquer texto para editar — salvo automaticamente
          </span>
        </div>

        {/* ══ CONTEÚDO PRINCIPAL ═══════════════════════════════════════════ */}
        <main
          style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 18px 52px" }}
          role="main"
          aria-label="Organograma e processos por setor"
        >

          {/* Título principal */}
          <header style={{ textAlign: "center", marginBottom: 22 }}>
            <TextoEditavel
              valor={dados.titulo}
              aoMudar={setTitulo}
              modoEdicao={modoEdicao}
              tag="h1"
              estilo={{
                fontSize: "clamp(16px, 2vw, 22px)",
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
                borderRadius: 8, padding: "10px 32px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                minWidth: 140,
                boxShadow: "0 4px 14px rgba(30,43,110,0.35)",
              }}
            >
              <TextoEditavel
                valor={dados.iconeTopo}
                aoMudar={setIconeTopo}
                modoEdicao={modoEdicao}
                tag="span"
                estilo={{ fontSize: 22, display: "block", textAlign: "center" }}
              />
              <TextoEditavel
                valor={dados.noTopo}
                aoMudar={setNoTopo}
                modoEdicao={modoEdicao}
                tag="span"
                estilo={{
                  fontSize: 13, fontWeight: 900, textAlign: "center",
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
                    borderRadius: 8,
                    padding: "8px 4px 6px",
                    width: "100%",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    minHeight: 78, boxSizing: "border-box",
                  }}>
                    <TextoEditavel
                      valor={dept.icone}
                      aoMudar={(v) => setIconeDept(dept.id, v)}
                      modoEdicao={modoEdicao}
                      tag="span"
                      estilo={{ fontSize: 15, lineHeight: 1, display: "block", textAlign: "center" }}
                    />
                    <TextoEditavel
                      valor={dept.nome}
                      aoMudar={(v) => setNomeDept(dept.id, v)}
                      modoEdicao={modoEdicao}
                      tag="span"
                      estilo={{
                        fontSize: "clamp(7.5px, 0.7vw, 10px)",
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
                      borderRadius: 6,
                      padding: "7px 6px 10px",
                      width: "100%", flex: 1,
                      boxSizing: "border-box",
                    }}
                  >
                    <h2 style={{
                      fontSize: "clamp(7px, 0.58vw, 9px)",
                      fontWeight: 900, color: C.navy,
                      textTransform: "uppercase", letterSpacing: "0.09em",
                      textAlign: "center",
                      paddingBottom: 4, marginBottom: 5,
                      borderBottom: `1px solid ${C.deptBorder}`,
                    }}>
                      PROCESSOS
                    </h2>
                    <ul style={{ margin: 0, padding: "0 0 0 11px", listStyle: "disc" }}>
                      {dept.processos.map((proc, idx) => (
                        <li key={idx} style={{
                          fontSize: "clamp(7px, 0.63vw, 9px)",
                          color: C.navy, marginBottom: 3, lineHeight: 1.38,
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

          {/* ══ PROCESSOS TRANSVERSAIS ═══════════════════════════════════════ */}
          <section
            aria-label="Processos transversais"
            style={{
              marginTop: 20,
              background: C.deptBg,
              border: `2px solid ${C.deptBorder}`,
              borderRadius: 8,
              padding: "11px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>

              {/* Ícone + rótulo */}
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
                <TextoEditavel
                  valor="⚙️"
                  aoMudar={() => {}}
                  modoEdicao={false}
                  tag="span"
                  estilo={{ fontSize: 22, display: "block" }}
                />
                <div>
                  <TextoEditavel
                    valor={dados.transversais.titulo}
                    aoMudar={setTransvTitulo}
                    modoEdicao={modoEdicao}
                    tag="h2"
                    estilo={{
                      fontSize: 11, fontWeight: 900, color: C.navy,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      display: "block", margin: 0,
                    }}
                  />
                  <TextoEditavel
                    valor={dados.transversais.subtitulo}
                    aoMudar={setTransvSubtitulo}
                    modoEdicao={modoEdicao}
                    tag="span"
                    estilo={{ fontSize: 9, color: C.navy, display: "block" }}
                  />
                </div>
              </div>

              {/* Itens transversais */}
              <div
                className="transv-itens"
                style={{ display: "flex", gap: 7, flex: 1, flexWrap: "wrap" }}
              >
                {dados.transversais.itens.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "rgba(255,255,255,0.68)",
                      border: `1px solid ${C.deptBorder}`,
                      borderRadius: 6, padding: "6px 9px",
                      flex: 1, minWidth: 130,
                    }}
                  >
                    <TextoEditavel
                      valor={item.icone}
                      aoMudar={(v) => setIconeTransv(item.id, v)}
                      modoEdicao={modoEdicao}
                      tag="span"
                      estilo={{ fontSize: 15, flexShrink: 0, display: "block" }}
                    />
                    <TextoEditavel
                      valor={item.texto}
                      aoMudar={(v) => setTransvItem(item.id, v)}
                      modoEdicao={modoEdicao}
                      tag="span"
                      estilo={{ fontSize: 9.5, color: C.navy, fontWeight: 700 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
