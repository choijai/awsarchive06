import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

// ─── NODES ───────────────────────────────────────────────────────────────────
const NODES = [
  { id:"ec2",        name:"EC2",             cat:"compute",   emoji:"🖥️", desc:"가상 서버 · AMI · Spot/Reserved · Placement Group" },
  { id:"lambda",     name:"Lambda",          cat:"compute",   emoji:"λ",  desc:"서버리스 함수 · 최대 15분 · 이벤트 트리거 · Concurrency" },
  { id:"ecs",        name:"ECS/EKS",         cat:"compute",   emoji:"🐳", desc:"컨테이너 · Fargate(서버리스) vs EC2 런치타입" },
  { id:"asg",        name:"Auto Scaling",    cat:"compute",   emoji:"📈", desc:"자동 스케일링 · Target Tracking / Step / Scheduled" },
  { id:"beanstalk",  name:"Beanstalk",       cat:"compute",   emoji:"🫘", desc:"PaaS · 코드만 올리면 인프라 자동 관리" },
  { id:"s3",         name:"S3",              cat:"storage",   emoji:"🪣", desc:"객체 스토리지 · Storage Class · Lifecycle · Versioning" },
  { id:"ebs",        name:"EBS",             cat:"storage",   emoji:"💾", desc:"블록 스토리지 · EC2 attach · gp3/io2/st1/sc1 · 단일 AZ" },
  { id:"efs",        name:"EFS",             cat:"storage",   emoji:"📁", desc:"네트워크 파일시스템 · 여러 EC2 동시 마운트 · Multi-AZ" },
  { id:"glacier",    name:"S3 Glacier",      cat:"storage",   emoji:"🧊", desc:"장기 아카이빙 · Instant/Flexible/Deep Archive" },
  { id:"rds",        name:"RDS",             cat:"database",  emoji:"🗄️", desc:"관리형 RDBMS · Multi-AZ · Read Replica · 자동 백업" },
  { id:"aurora",     name:"Aurora",          cat:"database",  emoji:"✨", desc:"AWS 최적화 DB · MySQL/PostgreSQL 호환 · 6개 복제본" },
  { id:"dynamodb",   name:"DynamoDB",        cat:"database",  emoji:"⚡", desc:"서버리스 NoSQL · DAX 캐시 · Global Tables" },
  { id:"elasticache",name:"ElastiCache",     cat:"database",  emoji:"🚀", desc:"인메모리 캐시 · Redis(영속성) vs Memcached(단순)" },
  { id:"redshift",   name:"Redshift",        cat:"database",  emoji:"📊", desc:"데이터 웨어하우스 · OLAP · Spectrum으로 S3 쿼리" },
  { id:"vpc",        name:"VPC",             cat:"network",   emoji:"🌐", desc:"가상 네트워크 · Subnet · IGW · NAT Gateway · SG" },
  { id:"elb",        name:"ELB",             cat:"network",   emoji:"⚖️", desc:"로드밸런서 · ALB(L7) · NLB(L4) · GWLB" },
  { id:"cloudfront", name:"CloudFront",      cat:"network",   emoji:"☁️", desc:"CDN · 엣지 캐싱 · OAC로 S3 보호 · Lambda@Edge" },
  { id:"route53",    name:"Route 53",        cat:"network",   emoji:"🔀", desc:"DNS · Weighted/Latency/Failover/Geolocation" },
  { id:"apigw",      name:"API Gateway",     cat:"network",   emoji:"🚪", desc:"API 관리 · REST/WebSocket · Lambda 통합 · Throttling" },
  { id:"directconn", name:"Direct Connect",  cat:"network",   emoji:"🔌", desc:"전용선 연결 · 안정적 대역폭 · VPN보다 일관된 성능" },
  { id:"iam",        name:"IAM",             cat:"security",  emoji:"🔐", desc:"권한 관리 · Role/Policy · STS AssumeRole" },
  { id:"kms",        name:"KMS",             cat:"security",  emoji:"🔑", desc:"키 관리 · CMK · S3/EBS/RDS 암호화 · Envelope Encryption" },
  { id:"waf",        name:"WAF & Shield",    cat:"security",  emoji:"🛡️", desc:"WAF: L7 방화벽 · Shield Standard/Advanced: DDoS 방어" },
  { id:"cognito",    name:"Cognito",         cat:"security",  emoji:"👤", desc:"사용자 인증 · User Pool(인증) + Identity Pool" },
  { id:"secrets",    name:"Secrets Manager", cat:"security",  emoji:"🗝️", desc:"비밀값 관리 · DB 비번 자동 로테이션" },
  { id:"sqs",        name:"SQS",             cat:"messaging", emoji:"📬", desc:"메시지 큐 · Standard vs FIFO · DLQ · Visibility Timeout" },
  { id:"sns",        name:"SNS",             cat:"messaging", emoji:"📣", desc:"Pub/Sub · Topic → 여러 구독자 · Fan-out 패턴" },
  { id:"eventbridge",name:"EventBridge",     cat:"messaging", emoji:"🌉", desc:"이벤트 버스 · 이벤트 기반 아키텍처 · 스케줄러" },
  { id:"kinesis",    name:"Kinesis",         cat:"messaging", emoji:"🌊", desc:"실시간 스트리밍 · Data Streams/Firehose/Analytics" },
  { id:"cloudwatch", name:"CloudWatch",      cat:"monitor",   emoji:"👁️", desc:"모니터링 · Metrics/Logs/Alarms/Dashboards" },
  { id:"cloudtrail", name:"CloudTrail",      cat:"monitor",   emoji:"📝", desc:"API 감사 로그 · 누가 뭘 언제 · S3 저장" },
];

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const CAT = {
  compute:  {color:"#e67e22",label:"Compute"},
  storage:  {color:"#2980b9",label:"Storage"},
  database: {color:"#8e44ad",label:"Database"},
  network:  {color:"#27ae60",label:"Network"},
  security: {color:"#c0392b",label:"Security"},
  messaging:{color:"#16a085",label:"Messaging"},
  monitor:  {color:"#7f8c8d",label:"Monitor"},
};

export interface AWSNode {
  id: string;
  name: string;
  cat: keyof typeof CAT;
  emoji: string;
  desc: string;
}

interface AWSGraphProps {
  onSelectNode?: (node: AWSNode | null) => void;
  selectedId?: string | null;
}

const AWSGraph: React.FC<AWSGraphProps> = ({ onSelectNode, selectedId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 520 });

  useEffect(() => {
    const updateSize = () => {
      const width = typeof window !== 'undefined' ? Math.min(window.innerWidth - 40, 1200) : 900;
      const height = typeof window !== 'undefined' ? Math.min(window.innerHeight - 200, 600) : 520;
      setDimensions({ width, height });
    };
    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  const R = 28;
  const W = dimensions.width;
  const H = dimensions.height;

  return (
    <div style={styles.container}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: '100%',
          height: '100%',
          background: '#060e18',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
        onClick={() => onSelectNode?.(null)}
      >
        <defs>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background dots */}
        {Array.from({ length: 70 }, (_, i) => (
          <circle
            key={`dot-${i}`}
            cx={(i * 179 + 53) % W}
            cy={(i * 113 + 41) % H}
            r={i % 6 === 0 ? 1.3 : 0.5}
            fill="white"
            opacity={0.06 + (i % 4) * 0.03}
          />
        ))}

        {/* Nodes */}
        {NODES.map((node) => {
          const cat = CAT[node.cat];
          const isSelected = node.id === selectedId;
          const x = (node.id.charCodeAt(0) * 97) % W;
          const y = (node.id.charCodeAt(0) * 131) % H;

          return (
            <g key={node.id}>
              <circle
                cx={x}
                cy={y}
                r={isSelected ? R + 6 : R}
                fill={cat.color}
                opacity={isSelected ? 1 : 0.8}
                filter={isSelected ? 'url(#glow1)' : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode?.(node);
                }}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  fill: 'white',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {node.emoji}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    minHeight: '500px',
    position: 'relative' as const,
};

export { NODES, CAT };
export default AWSGraph;
