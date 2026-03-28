export type Concept = {
  title: string;
  subtitle: string;
  easy: string;
  points: Array<{
    label: string;
    text: string;
    easy: string;
  }>;
};

export const CONCEPTS_EN: Record<string, Concept> = {
  ec2: {
    title: "Amazon EC2",
    subtitle: "Elastic Compute Cloud",
    easy: "EC2 is my computer on the internet! I can turn it on and off like a PC at home, but it's in an AWS data center. I pay only for what I use. If I use it always, I can reserve it in advance and save up to 72%.",
    points: [
      {
        label: "Instance Purchase Options",
        text: "On-Demand(flexible), Reserved(1-3 year commitment save up to 72%), Spot(save up to 90%, can terminate anytime), Dedicated Host(physical server exclusive)",
        easy: "It's like a rental car! On-Demand is same-day rental(expensive), Reserved is a 1-year contract(cheap), Spot is a super discount but can be taken away anytime."
      },
      {
        label: "AMI",
        text: "Amazon Machine Image. Instance OS/software template. Quick deployment with custom AMI. Can copy across regions",
        easy: "It's a cookie cutter! Once I make a cutter(AMI), I can quickly stamp out identical cookies(servers) as many as I want."
      },
      {
        label: "Placement Group",
        text: "Cluster(same AZ, low latency), Spread(different hardware, fault isolation), Partition(large-scale distributed systems)",
        easy: "It's like seating arrangement in a classroom! Cluster is sitting together(fast communication), Spread is sitting far apart(if one person is absent, other teams aren't affected)."
      },
      {
        label: "Storage",
        text: "EBS(permanent block), Instance Store(temporary, fast), EFS(shared file system)",
        easy: "EBS is a personal locker(persists when off), Instance Store is a memo on desk(disappears when off), EFS is a shared cabinet(multiple people use it)."
      },
      {
        label: "Exam Points",
        text: "Spot Instance termination: 2-minute warning. Reserved has AZ or Region scope. Hibernate maintains RAM while stopped",
        easy: "Spot is an empty karaoke room - if someone else books it, I have to leave in 2 minutes! Hibernate is laptop sleep mode - resume and everything is still there."
      }
    ]
  },
  lambda: {
    title: "AWS Lambda",
    subtitle: "Serverless Function Execution",
    easy: "Lambda is an errand boy! He only runs and handles the job when a file is uploaded, then disappears. No need to keep it running, so cost is almost zero!",
    points: [
      {
        label: "Execution Limits",
        text: "Max execution time 15 minutes, memory 128MB-10GB, /tmp storage 512MB-10GB, default concurrent execution 1000",
        easy: "Lambda is a sprinter. Must finish in 15 minutes. For long tasks, use ECS instead."
      },
      {
        label: "Triggers",
        text: "API Gateway, S3, DynamoDB Streams, SQS, SNS, EventBridge, ALB, Cognito, etc.",
        easy: "It's an alarm! When a signal like 'file uploaded' or 'message arrived' comes, it automatically wakes up and works."
      },
      {
        label: "Concurrency",
        text: "Reserved Concurrency(limit max concurrent execution), Provisioned Concurrency(prevent cold start, pre-warm)",
        easy: "Reserved is setting a limit like 'maximum 10 errand boys', Provisioned is keeping them on standby in advance."
      },
      {
        label: "Deployment",
        text: "Zip file or Container Image(max 10GB). Share common libraries with Lambda Layer",
        easy: "Zip is packing a bento box to send, Container Image is delivering an entire restaurant. Layer is a shared tool warehouse."
      },
      {
        label: "Exam Points",
        text: "Deploying in VPC creates ENI → cold start increases. Jobs over 15 minutes use ECS/Fargate. SQS enables batch processing",
        easy: "If you put Lambda inside VPC, cold start gets longer. Jobs over 15 minutes - let ECS handle them!"
      }
    ]
  },
  s3: {
    title: "Amazon S3",
    subtitle: "Simple Storage Service",
    easy: "S3 is a huge internet warehouse! Can store anything - photos, videos, files - unlimited capacity. Store frequently accessed items near the entrance(Standard), rarely accessed items deep in warehouse(Glacier) to save storage costs.",
    points: [
      {
        label: "Storage Classes",
        text: "Standard → Standard-IA → One Zone-IA → Glacier Instant → Glacier Flexible → Deep Archive (cost order)",
        easy: "Like organizing a house! Frequently used in living room(Standard), sometimes used in storage(IA), rarely used in frozen basement(Glacier). Farther away is less convenient but cheaper."
      },
      {
        label: "Security",
        text: "Bucket Policy(resource-based), IAM Policy(user-based), ACL(legacy), Presigned URL(temporary access), OAC",
        easy: "Bucket Policy is warehouse door rules, IAM is employee ID card, Presigned URL is temporary visitor pass."
      },
      {
        label: "Features",
        text: "Versioning, MFA Delete, Replication(CRR/SRR), Lifecycle(auto conversion/deletion)",
        easy: "Like Google Docs version history! Previous versions are kept, so you can recover from accidental deletion."
      },
      {
        label: "Performance",
        text: "3,500 PUT / 5,500 GET per second per prefix. Multipart upload(recommended for 100MB+, required for 5GB+)",
        easy: "Divide large package into pieces and send simultaneously(multipart). Multiple boxes = faster!"
      },
      {
        label: "Exam Points",
        text: "S3 bucket is global but data stored in region. CORS settings. Static website hosting possible",
        easy: "S3 bucket name must be unique worldwide. Data stored in the region you choose."
      }
    ]
  },
  rds: {
    title: "Amazon RDS",
    subtitle: "Relational Database Service",
    easy: "RDS is a data warehouse organized like Excel! AWS manages it, so backups are automatic. Multi-AZ stores the same content in another warehouse, Read Replica creates multiple read-only copies.",
    points: [
      {
        label: "Multi-AZ",
        text: "Synchronous replication(Standby). Auto failover 60-120 seconds on failure. No read access(standby is waiting). DNS record changes",
        easy: "It's an emergency backup hospital! If main hospital closes, backup hospital automatically opens in 1-2 minutes. Backup hospital just waits normally."
      },
      {
        label: "Read Replica",
        text: "Asynchronous replication. For read distribution. Can be in different region. Can promote to independent DB. Max 5",
        easy: "It's a textbook copy! When the original is busy, multiple copies let everyone read together."
      },
      {
        label: "Backups",
        text: "Automatic backup(1-35 days), manual snapshot(indefinite retention)",
        easy: "Automatic backup is a daily automatic photo, snapshot is a photo I take manually and keep forever."
      },
      {
        label: "Encryption",
        text: "Set KMS encryption at creation. Cannot change after(snapshot → copy → encrypted restore needed)",
        easy: "Can only choose lock when making safe. To change later, must take out contents and put in new safe."
      },
      {
        label: "Exam Points",
        text: "Multi-AZ ≠ read distribution(that's Read Replica). RDS Proxy for Lambda connection pooling. Storage auto-scales",
        easy: "Multi-AZ is 'safety'(backup), Read Replica is 'speed'(distribution). Definitely appears on exam!"
      }
    ]
  },
  aurora: {
    title: "Amazon Aurora",
    subtitle: "AWS Optimized Relational Database",
    easy: "Aurora is the super version of RDS! Stores 6 copies across 3 AZs. 5x faster than MySQL but similar price!",
    points: [
      {
        label: "Architecture",
        text: "Storage auto 10GB-128TB. 6 copies across 3 AZs. 2 failures still allow writes, 3 failures still allow reads",
        easy: "Like placing the same book in 3 libraries with 6 copies each. Even if 2 libraries burn down, the book is safe."
      },
      {
        label: "Performance",
        text: "5x faster than MySQL, 3x faster than PostgreSQL. Aurora Parallel Query",
        easy: "If regular RDS is a bicycle, Aurora is a sports car. MySQL code runs 5x faster!"
      },
      {
        label: "Features",
        text: "Aurora Serverless v2: auto-scaling. Global Database: <1 second cross-region replication",
        easy: "Serverless v2 automatically adjusts tables based on customer count. Global DB reflects Korea→US in under 1 second."
      },
      {
        label: "Aurora vs RDS",
        text: "Aurora: when high performance/high availability needed. RDS: when specific engine needed like Oracle, SQL Server",
        easy: "Aurora is AWS's special high-performance engine, RDS is for when you want a specific company's database."
      },
      {
        label: "Exam Points",
        text: "Aurora Replica shares identical storage(no replication lag). Backtrack to rewind to specific point in time",
        easy: "Aurora Replica shares same warehouse so copy time approaches zero."
      }
    ]
  },
  vpc: {
    title: "Amazon VPC",
    subtitle: "Virtual Private Cloud",
    easy: "VPC is my fenced neighborhood in AWS! Public Subnet is accessible from internet, Private Subnet is accessible from within only.",
    points: [
      {
        label: "Components",
        text: "Subnet(Public/Private), Route Table, IGW, NAT Gateway, VPC Peering",
        easy: "Public area is accessible to outsiders, Private area is residents only. IGW is main gate, NAT is side door."
      },
      {
        label: "Security",
        text: "Security Group: Stateful, allow-only. NACL: Stateless, allow+deny, subnet level",
        easy: "SG is front door of a house(auto allow), NACL is neighborhood guard(checks both). SG only allows, NACL also denies."
      },
      {
        label: "Connectivity",
        text: "VPN, Direct Connect(dedicated line), Transit Gateway(multiple VPC hub connection)",
        easy: "VPN is regular road, Direct Connect is dedicated highway, Transit Gateway is hub intersection."
      },
      {
        label: "Endpoints",
        text: "Gateway Endpoint: S3, DynamoDB(free). Interface Endpoint: others(ENI, costs)",
        easy: "When accessing S3 from within VPC, Gateway Endpoint is like a free branch office!"
      },
      {
        label: "Exam Points",
        text: "SG is Stateful, NACL is Stateless. NAT Gateway located in Public Subnet",
        easy: "SG is smart(auto allow), NACL is picky(must set both). NAT must be installed in public area!"
      }
    ]
  },
  iam: {
    title: "AWS IAM",
    subtitle: "Identity and Access Management",
    easy: "IAM is a company ID card management system! Give each employee an ID, group permissions by team.",
    points: [
      {
        label: "Components",
        text: "User(individual), Group(collection), Role(temporary permission delegation), Policy(JSON permission document)",
        easy: "User is employee, Group is team, Role is temporary ID, Policy is rule book."
      },
      {
        label: "Policy Types",
        text: "Identity-based, Resource-based, Permission Boundary, SCP(Organizations)",
        easy: "Identity-based is employee ID permissions, Resource-based is door guidance sign, SCP is company top-level rule."
      },
      {
        label: "STS",
        text: "AssumeRole for temporary credentials. Cross-account access, EC2 Instance Profile, Web Identity Federation",
        easy: "STS is temporary pass issuer! Issues time-limited temporary passes to other accounts or external people."
      },
      {
        label: "Best Practice",
        text: "Don't use root account, MFA, least privilege principle, rotate Access Keys, audit with CloudTrail",
        easy: "Root account is CEO's stamp - can't use daily. Grant only minimum permissions!"
      },
      {
        label: "Exam Points",
        text: "Policy evaluation: explicit Deny > SCP > Permission Boundary > Identity > Resource Policy",
        easy: "If there's an explicit Deny, it's blocked no matter what! Even if other allows exist, one Deny blocks everything."
      }
    ]
  },
  sqs: {
    title: "Amazon SQS",
    subtitle: "Simple Queue Service",
    easy: "SQS is a mailbox! Put letters in it, delivery person takes them out and processes later. Even if busy, letters are safely stored!",
    points: [
      {
        label: "Types",
        text: "Standard: minimum 1 delivery(duplicates possible), no order guarantee, high throughput. FIFO: exactly once, order guaranteed, 300-3000 TPS",
        easy: "Standard is regular mail(fast but may deliver twice), FIFO is registered mail(slow but exactly once, order guaranteed)."
      },
      {
        label: "Key Settings",
        text: "Visibility Timeout(default 30 seconds), Message Retention(1 minute-14 days), Max Size: 256KB",
        easy: "Visibility Timeout is hiding the message after delivery person picks it up so others can't see it."
      },
      {
        label: "DLQ",
        text: "Dead Letter Queue. Isolate failed messages. Move after maxReceiveCount exceeded",
        easy: "Special mailbox for failed deliveries. Can check later why delivery failed."
      },
      {
        label: "Long Polling",
        text: "Reduce empty queue polling to save costs. WaitTimeSeconds 1-20 seconds. Recommended over Short Polling",
        easy: "Short Polling checks every 1 second, Long Polling waits 'up to 20 seconds for letter to arrive'."
      },
      {
        label: "Exam Points",
        text: "SQS → Lambda batch processing. Fan-out: SNS → multiple SQS. FIFO requires .fifo suffix",
        easy: "Fan-out is when SNS broadcasts and multiple SQS receive simultaneously."
      }
    ]
  },
  cloudwatch: {
    title: "Amazon CloudWatch",
    subtitle: "Monitoring & Observation Service",
    easy: "CloudWatch is AWS's CCTV + alarm system! Watches server status and alerts when something goes wrong!",
    points: [
      {
        label: "Metrics",
        text: "Basic 5 minutes(free), detailed 1 minute(paid). Custom metrics possible",
        easy: "Basic CCTV takes photo every 5 minutes(free), HD takes every 1 minute(paid)."
      },
      {
        label: "Logs",
        text: "Log Group → Log Stream. Log Insights for queries. Metric Filter converts logs→metrics",
        easy: "Log Group is diary, Log Stream is dated pages. Insights lets you search like Google."
      },
      {
        label: "Alarms",
        text: "OK/ALARM/INSUFFICIENT_DATA. Actions: SNS, EC2 stop/terminate, ASG scaling",
        easy: "If CPU exceeds 90%, get text alert! If critical, auto-scale servers(ASG)."
      },
      {
        label: "Events/EventBridge",
        text: "Detect AWS events → automate. Cron/Rate schedule execution",
        easy: "Set automation rules like 'backup every night at 12am'."
      },
      {
        label: "Exam Points",
        text: "EC2 memory/disk are not basic metrics → CloudWatch Agent needed. Cross-account collection possible",
        easy: "EC2 memory monitoring requires Agent installation! Frequently on exam."
      }
    ]
  },
  elb: {
    title: "AWS Elastic Load Balancer",
    subtitle: "Load Balancing Service",
    easy: "ELB is a traffic dispatcher! Distributes customer traffic across multiple servers so no single server gets overloaded.",
    points: [
      {
        label: "Types",
        text: "ALB(Application, Layer 7), NLB(Network, Layer 4), CLB(Classic, Layer 4/7, legacy)",
        easy: "ALB for web apps(smart), NLB for extreme speed(dumb but fast), CLB is old version."
      },
      {
        label: "Health Checks",
        text: "Regularly test servers. Unhealthy instances removed. Healthy ones added back",
        easy: "Constantly ping servers - if no response, stop sending traffic."
      },
      {
        label: "Stickiness",
        text: "Cookie-based stickiness: same customer goes to same server. Useful for session data",
        easy: "Like restaurant loyalty - regular customer goes to favorite table."
      },
      {
        label: "Cross-Zone LB",
        text: "Distribute traffic evenly across AZs. Small cost but better availability",
        easy: "Balance traffic across multiple zones so one zone failure doesn't hurt."
      },
      {
        label: "Exam Points",
        text: "ALB for microservices(hostname routing). NLB for extreme throughput. Target Group health",
        easy: "ALB smart routing, NLB crazy fast, CLB forget about it!"
      }
    ]
  },
  dynamodb: {
    title: "Amazon DynamoDB",
    subtitle: "Serverless NoSQL Database",
    easy: "DynamoDB is like a drawer cabinet! Can store anything freely in each drawer(item), read/write millions per second!",
    points: [
      {
        label: "Capacity Modes",
        text: "On-Demand: auto-handle traffic, unpredictable workload. Provisioned: set RCU/WCU, cheaper, auto-scaling",
        easy: "On-Demand auto-handles any customer count(expensive), Provisioned pre-plan for 100 customers(cheap but errors if exceed)."
      },
      {
        label: "Keys",
        text: "Partition Key(must have), Sort Key(optional). Together form unique identifier",
        easy: "Partition Key is filing cabinet drawer, Sort Key is file order in drawer."
      },
      {
        label: "Indexes",
        text: "GSI(Global Secondary Index): different partition/sort keys. LSI(Local): same partition, different sort",
        easy: "GSI is entirely new filing system, LSI is reordering same drawer."
      },
      {
        label: "TTL",
        text: "Time To Live. Auto-delete items after timestamp. Reduces storage costs",
        easy: "Like expiration date - automatically delete old items."
      },
      {
        label: "Exam Points",
        text: "DynamoDB Streams for CDC(Change Data Capture) → Lambda. On-Demand for unpredictable",
        easy: "Streams catch changes, trigger Lambda. On-Demand for unknown patterns."
      }
    ]
  },
  kms: {
    title: "AWS Key Management Service",
    subtitle: "Encryption Key Management",
    easy: "KMS is a locksmith service! Create and manage encryption keys. Encrypt sensitive data with customer-managed keys.",
    points: [
      {
        label: "Key Types",
        text: "AWS managed(free), Customer managed(pay per use), AWS owned(no control)",
        easy: "AWS managed = free house lock, Customer managed = you control lock, AWS owned = AWS lock."
      },
      {
        label: "Key Rotation",
        text: "Automatic rotation every year. Manual rotation if needed. Backward compatible",
        easy: "Like changing office locks yearly - old keys still work(backward compatible)."
      },
      {
        label: "Grants",
        text: "Delegate key access temporarily. Useful for cross-account access",
        easy: "Temporarily let someone borrow your key without changing permissions."
      },
      {
        label: "Encryption",
        text: "Encrypt data at rest(S3, RDS, EBS) and in transit(TLS/HTTPS)",
        easy: "Data locked at rest, locked during transport."
      },
      {
        label: "Exam Points",
        text: "KMS for encryption. CMK(Customer Master Key) for control. Envelope encryption",
        easy: "Control = CMK. Envelope = encrypt data key with master key."
      }
    ]
  },
  cloudfront: {
    title: "Amazon CloudFront",
    subtitle: "Content Delivery Network",
    easy: "CloudFront is like having delivery branches worldwide! Users in Tokyo get content from Tokyo server, not America server. Way faster!",
    points: [
      {
        label: "Edge Locations",
        text: "450+ edge locations globally. Cache static content. Origin: S3, EC2, ALB, custom",
        easy: "Like convenience stores everywhere - serve content from nearest store."
      },
      {
        label: "Caching",
        text: "Default 24 hours. TTL configurable. Invalidate cache with wildcard/paths",
        easy: "Cache content locally for speed. Refresh when content changes."
      },
      {
        label: "Security",
        text: "HTTPS/TLS. WAF integration. Origin access control(OAC). Field-level encryption",
        easy: "Secure data in transit. Prevent attacks. Encrypt sensitive fields."
      },
      {
        label: "Price Classes",
        text: "All: all edge locations. 100: exclude expensive regions. 200: exclude most expensive",
        easy: "All = most expensive, 100 = medium, 200 = cheapest. Tradeoff speed vs cost."
      },
      {
        label: "Exam Points",
        text: "CloudFront vs S3: CF for edge caching, S3 for storage. CF invalidation = cache refresh",
        easy: "Need speed globally? CloudFront. Need storage? S3. Why not both?"
      }
    ]
  },
  route53: {
    title: "Amazon Route 53",
    subtitle: "Domain Name System & Traffic Routing",
    easy: "Route 53 is the internet phone directory! Converts www.example.com to actual IP address instantly.",
    points: [
      {
        label: "Routing Policies",
        text: "Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multi-value",
        easy: "Weighted for A/B testing, Latency for fastest server, Failover for backup server."
      },
      {
        label: "Health Checks",
        text: "Monitor endpoints. 15 global health checkers. Essential with Failover",
        easy: "Every 30 seconds ask servers 'are you alive?'. No response = route to backup."
      },
      {
        label: "Record Types",
        text: "A(IPv4), AAAA(IPv6), CNAME(domain→domain), Alias(AWS resources, Zone Apex compatible, free)",
        easy: "A = name→address, CNAME = name→different name, Alias = AWS-only and free."
      },
      {
        label: "Domain",
        text: "Can purchase domains. Public vs Private Hosted Zone. DNSSEC support",
        easy: "Can buy domain from Route 53. Private is internal phone directory for VPC only."
      },
      {
        label: "Exam Points",
        text: "Alias for ELB, CloudFront, S3. CNAME not possible at Zone Apex. Always choose Alias!",
        easy: "Cannot use CNAME at root domain, Alias only! For AWS services, always use Alias!"
      }
    ]
  },
  sns: {
    title: "Amazon SNS",
    subtitle: "Simple Notification Service",
    easy: "SNS is a broadcast system! Shout into microphone(Topic) 'Lunch is ready!' and all students(subscribers) hear simultaneously. Can send to SQS, Lambda, email at same time!",
    points: [
      {
        label: "Overview",
        text: "Pub/Sub messaging. Publisher → Topic → Subscribers. Subscribers: SQS, Lambda, Email, SMS, HTTP, Kinesis Firehose",
        easy: "It's like radio broadcast! Broadcasting station(Publisher) broadcasts to airwaves(Topic), and radios(subscribers) receive simultaneously. Can add subscribers endlessly."
      },
      {
        label: "Message Filtering",
        text: "Filter policies per subscription. Each subscriber receives only matching messages",
        easy: "Like email filters - subscriber only gets messages matching their filter rule."
      },
      {
        label: "Delivery",
        text: "Push to HTTP endpoints, pull from SQS, trigger Lambda, notify email/SMS",
        easy: "SNS pushes messages to different places simultaneously - like a mail sorting center."
      },
      {
        label: "Fan-out Pattern",
        text: "SNS → multiple SQS for parallel processing. Each SQS gets full message copy",
        easy: "One SNS message fans out to 10 SQS - like one announcement to 10 different groups."
      },
      {
        label: "Exam Points",
        text: "SNS push ≠ SQS pull. SNS-SQS fan-out for durable async processing. FIFO SNS-SQS support",
        easy: "SNS shouts(push), SQS stores(pull). Together = durable broadcast!"
      }
    ]
  },
  kinesis: {
    title: "Amazon Kinesis",
    subtitle: "Real-Time Data Streaming",
    easy: "Kinesis is conveyor belt for data! Stream massive data in real-time. Like assembly line for information - continuous flow.",
    points: [
      {
        label: "Kinesis Data Streams",
        text: "Producers → Shards → Consumers. 24-hour retention(configurable). Partition key for shard routing",
        easy: "Like lanes on highway. Each lane handles traffic independently. Data automatically routed to lanes."
      },
      {
        label: "Kinesis Firehose",
        text: "Deliver data to S3, Redshift, Splunk, DataDog. Fully managed. ETL optional",
        easy: "Automatic conveyor to warehouse. Transform data if needed. No capacity management."
      },
      {
        label: "Consumers",
        text: "Application, Lambda, Kinesis Analytics, DynamoDB. Parallel consumption per shard",
        easy: "Multiple workers handle same lane independently. Massive parallelism."
      },
      {
        label: "Scaling",
        text: "Add shards to scale. Each shard = 1MB/sec write. Use TPS = RPS x record size",
        easy: "Traffic increasing? Add lanes(shards). Each lane handles 1MB/sec."
      },
      {
        label: "Exam Points",
        text: "Kinesis Streams for real-time, Firehose for delivery. SQS for batch, Kinesis for streaming",
        easy: "SQS = batch processing, Kinesis = real-time streaming. Different tools, different speed!"
      }
    ]
  },
  elasticache: {
    title: "Amazon ElastiCache",
    subtitle: "In-Memory Cache Service",
    easy: "ElastiCache is super-fast memory storage! Like keeping frequently used books on desk instead of in library. Redis or Memcached.",
    points: [
      {
        label: "Engines",
        text: "Redis: data structures, persistence, pub/sub. Memcached: simple key-value, fastest",
        easy: "Redis is smart cache(keeps data even if off), Memcached is simple cache(lose data if off)."
      },
      {
        label: "Use Cases",
        text: "Session storage, real-time leaderboards, caching DB queries, rate limiting",
        easy: "Like keeping 'did you log in' reminder, game rankings, frequently used search results."
      },
      {
        label: "Eviction Policies",
        text: "LRU(least recently used), LFU(least frequently used), TTL(time to live)",
        easy: "When memory full, delete least used or oldest items."
      },
      {
        label: "High Availability",
        text: "Multi-AZ with automatic failover. Cluster mode for horizontal scaling",
        easy: "Backup instance ready, horizontal scaling for more speed."
      },
      {
        label: "Exam Points",
        text: "ElastiCache vs RDS: cache for speed, DB for storage. Redis Cluster for large data",
        easy: "Need speed? Cache. Need data? Database. Both? Use together!"
      }
    ]
  },
  ebs: {
    title: "Amazon EBS",
    subtitle: "Elastic Block Storage",
    easy: "EBS is like a hard drive for EC2! Plugs into instance, stores data permanently, can take snapshot backup.",
    points: [
      {
        label: "Volume Types",
        text: "gp3(general, 3 IOPS per GB), gp2(older), io1(high IOPS), st1(throughput), sc1(cold)",
        easy: "gp3 is good all-rounder(new version faster), io1 is for databases(very fast), st1 is wide highway, sc1 is backup."
      },
      {
        label: "Snapshots",
        text: "Block-level incremental backup. Can copy across regions. Can create AMI from snapshot",
        easy: "Like backup of hard drive. Only new parts stored(incremental). Can restore or create image."
      },
      {
        label: "Encryption",
        text: "Encrypt at creation with KMS. Can copy encrypted snapshot. Re-encrypt by copy",
        easy: "Choose encryption when creating. To change, must copy to encrypted volume."
      },
      {
        label: "Performance",
        text: "IOPS and throughput limits per volume type. Can modify gp3 without detaching",
        easy: "Each volume has speed limit. gp3 can adjust speed without stopping."
      },
      {
        label: "Exam Points",
        text: "EBS vs Instance Store: EBS persists, Instance Store disappears. io1 for high performance",
        easy: "EBS = locker(persists), Instance Store = memo(disappears). Choose based on need!"
      }
    ]
  },
  efs: {
    title: "Amazon EFS",
    subtitle: "Elastic File System",
    easy: "EFS is like a shared file cabinet! Multiple EC2 instances can access same files simultaneously. Perfect for shared storage.",
    points: [
      {
        label: "Access",
        text: "NFS protocol. Mount via mount target in subnet. Auto-scales, no pre-provisioning",
        easy: "Like network drive on company office. Multiple computers share same files."
      },
      {
        label: "Performance Modes",
        text: "General Purpose(default, most uses), Max IO(high concurrency, enterprise apps)",
        easy: "General Purpose for normal use, Max IO for heavy workloads."
      },
      {
        label: "Throughput Modes",
        text: "Bursting(default, scales with file count), Provisioned(fixed throughput)",
        easy: "Bursting grows automatically, Provisioned sets fixed speed."
      },
      {
        label: "Storage Classes",
        text: "Standard, Standard-IA(infrequent access). Lifecycle policies automatic transition",
        easy: "Standard for frequent access, IA for rare access - cheaper!"
      },
      {
        label: "Exam Points",
        text: "EFS vs EBS: EFS shared, EBS single instance. EFS more expensive, EBS faster",
        easy: "EFS for sharing, EBS for speed. Share = EFS, Speed = EBS."
      }
    ]
  },
  cognito: {
    title: "Amazon Cognito",
    subtitle: "User Authentication & Authorization",
    easy: "Cognito is your app's login system! Handle user signup, login, MFA, social login(Google/Facebook), all built-in.",
    points: [
      {
        label: "User Pool",
        text: "User directory for app. Username/email password. MFA support. Custom attributes",
        easy: "Like user database. Social login integration. Password reset email."
      },
      {
        label: "Identity Pool",
        text: "Temporary AWS credentials. Access AWS services like S3, DynamoDB. Role-based",
        easy: "After login, get key to use AWS services. Different roles different permissions."
      },
      {
        label: "MFA",
        text: "TOTP(authenticator app), SMS, email. Backup codes",
        easy: "Extra security. Code from phone + password."
      },
      {
        label: "Custom Auth Flow",
        text: "Custom Lambda for authentication logic. Challenge/response",
        easy: "Custom login rules. Like 'must login from company IP'."
      },
      {
        label: "Exam Points",
        text: "User Pool for login, Identity Pool for AWS access. Cognito = auth, IAM = permissions",
        easy: "User Pool = 'who are you?', Identity Pool = 'what can you do?'"
      }
    ]
  },
  ecs: {
    title: "Amazon ECS",
    subtitle: "Elastic Container Service",
    easy: "ECS is container management! Run Docker containers on EC2 or Fargate(serverless). Orchestrate, scale, restart automatically.",
    points: [
      {
        label: "Launch Types",
        text: "EC2: manage instances yourself. Fargate: serverless containers, pay per task",
        easy: "EC2 = rent apartment + manage yourself. Fargate = hotel room + hotel manages."
      },
      {
        label: "Task Definition",
        text: "Blueprint for container. Specifies Docker image, memory, CPU, environment variables",
        easy: "Recipe for container. Docker image, ingredients(memory/CPU), instructions."
      },
      {
        label: "Service",
        text: "Manage tasks. Auto-scaling, load balancing, self-healing. Desired count",
        easy: "Keep certain number of containers running. Auto-restart if fail."
      },
      {
        label: "Cluster",
        text: "Group of resources(EC2 instances or Fargate). Network and security",
        easy: "Like building complex with multiple apartments(tasks)."
      },
      {
        label: "Exam Points",
        text: "ECS Fargate for simplicity. EC2 for cost optimization. CloudWatch auto-scaling",
        easy: "Want easy? Fargate. Want cheap? EC2. Scale with CloudWatch metrics!"
      }
    ]
  },
  asg: {
    title: "Auto Scaling Group",
    subtitle: "Automatic Instance Scaling",
    easy: "ASG is auto-hiring/firing! Add servers when busy(scale up), remove when quiet(scale down). Automatic elasticity.",
    points: [
      {
        label: "Policies",
        text: "Target tracking: maintain metric at level. Step scaling: scale by increment. Simple: single threshold",
        easy: "Target = keep 70% CPU. Step = +1 instance per 20% CPU over 70%. Simple = if > 80%, add one."
      },
      {
        label: "Lifecycle Hooks",
        text: "Execute custom scripts during launch/terminate. Perfect for graceful shutdown",
        easy: "When instance dying, play goodbye music first. When baby instance born, set up room."
      },
      {
        label: "Health Checks",
        text: "ELB health check, EC2 status check. Auto-replace unhealthy instances",
        easy: "Constantly check if instances healthy. Replace sick ones."
      },
      {
        label: "Cooldown",
        text: "Wait time before next scaling action. Prevent thrashing",
        easy: "After scaling, wait before checking again. Don't keep flipping on/off."
      },
      {
        label: "Exam Points",
        text: "ASG with ELB for high availability. Lifecycle hooks for graceful shutdown",
        easy: "ASG + ELB = auto-scale + load balance. Perfect combo!"
      }
    ]
  },
  beanstalk: {
    title: "AWS Elastic Beanstalk",
    subtitle: "Platform as a Service",
    easy: "Beanstalk is like renting furnished apartment! Just provide code, Beanstalk handles servers, databases, scaling, monitoring.",
    points: [
      {
        label: "Environments",
        text: "Dev: single instance(cheap). Prod: load balanced(expensive but scalable)",
        easy: "Dev = studio apartment, Prod = full house with servants."
      },
      {
        label: "Supported Platforms",
        text: "Node.js, Python, Ruby, Java, Go, .NET, Docker, custom platform",
        easy: "Many languages supported. Or bring own Docker."
      },
      {
        label: "Deployment",
        text: "Git push, CLI, console. Automatic blue/green deployment. Rollback if fail",
        easy: "Deploy like GitHub push. Automatic test new version, keep old version ready."
      },
      {
        label: "Customization",
        text: "Environment variables, .ebextensions config, web.config, procfile",
        easy: "Can customize everything if needed. Config files control behavior."
      },
      {
        label: "Exam Points",
        text: "Beanstalk for quick PaaS deployment. CloudFormation underneath. Health monitoring",
        easy: "Beanstalk = PaaS, EC2 = IaaS. Beanstalk easier, EC2 more control."
      }
    ]
  },
  glacier: {
    title: "Amazon S3 Glacier",
    subtitle: "Cold Storage Service",
    easy: "Glacier is deep freeze storage! Extremely cheap but retrieval takes time. For data you rarely access but must keep.",
    points: [
      {
        label: "Retrieval Times",
        text: "Instant: 1-5 minutes. Flexible: 3-5 hours. Deep: 12 hours",
        easy: "Instant is quick thaw, Flexible is overnight thaw, Deep is next day thaw."
      },
      {
        label: "Vault Lock",
        text: "WORM(Write Once Read Many) enforcement. Compliance locking immutable",
        easy: "Like lockable safe - once locked, can't delete even if want to. For regulations."
      },
      {
        label: "Lifecycle Policy",
        text: "Auto-move from S3 → Glacier after set days. Reduce storage costs 80%+",
        easy: "Old files automatically move to cold storage - like archiving old papers."
      },
      {
        label: "Restore",
        text: "Restore to S3 temporarily. DynamoDB Streams trigger restore automation",
        easy: "When needing file, temporarily restore to S3, then back to Glacier."
      },
      {
        label: "Exam Points",
        text: "Glacier Instant vs Flexible: retrieval time tradeoff. Vault Lock for compliance",
        easy: "Need quick? Instant. Can wait? Flexible (way cheaper). Compliance? Lock it!"
      }
    ]
  },
  redshift: {
    title: "Amazon Redshift",
    subtitle: "Data Warehouse Service",
    easy: "Redshift is a huge warehouse for analyzing big data! Stores massive amounts cheaply and analyzes fast. Better than RDS for analytics.",
    points: [
      {
        label: "Architecture",
        text: "Leader node(query routing) + Compute nodes(data storage/query). Columnar storage",
        easy: "Leader directs traffic, Compute nodes do heavy lifting. Organize by column not row(faster analysis)."
      },
      {
        label: "Data Loading",
        text: "COPY from S3, DynamoDB, or EC2. Parallel ingestion. Bulk operations fast",
        easy: "Load thousands of rows simultaneously from S3. Like bulk truck vs small car."
      },
      {
        label: "Performance",
        text: "Compression reduces size 10x. Sortkeys and distribution key for optimization",
        easy: "Compression = zip files. Sortkey = pre-organize data. Distribution = split data wisely."
      },
      {
        label: "Backup & Restore",
        text: "Auto-snapshots to S3. Cross-region copy. Restore to new cluster",
        easy: "Automatic backup to S3. Can restore to another region if disaster."
      },
      {
        label: "Exam Points",
        text: "Redshift for OLAP(analysis), RDS for OLTP(transaction). Redshift much cheaper for large data",
        easy: "Redshift = analytics warehouse, RDS = operational database. Different tools, different use!"
      }
    ]
  },
  directconn: {
    title: "AWS Direct Connect",
    subtitle: "Dedicated Network Connection",
    easy: "Direct Connect is private highway to AWS! Instead of internet, use dedicated line. More secure, faster, consistent.",
    points: [
      {
        label: "Connection Types",
        text: "Dedicated Connection: AWS allocates port. Hosted Connection: 3rd party provider allocates",
        easy: "Dedicated = own highway exit. Hosted = share highway with others."
      },
      {
        label: "Virtual Interfaces",
        text: "Private VIF: VPC access. Public VIF: AWS public services. Transit VIF: Transit Gateway",
        easy: "Private = to VPC, Public = to S3/DynamoDB, Transit = to multiple VPCs."
      },
      {
        label: "Advantages",
        text: "Reduced bandwidth cost, consistent network, private, low latency, high availability",
        easy: "Like exclusive train vs crowded bus. Faster, reliable, private."
      },
      {
        label: "Setup",
        text: "Order from AWS, coordinate with provider, configure routers, 4-8 week lead time",
        easy: "Takes time to set up but worth for enterprise."
      },
      {
        label: "Exam Points",
        text: "Direct Connect for enterprise. BGP routing protocol. Backup with VPN",
        easy: "Expensive but secure. Pair with VPN backup for failover."
      }
    ]
  },
  waf: {
    title: "AWS WAF",
    subtitle: "Web Application Firewall",
    easy: "WAF is bouncer at nightclub! Blocks bad requests(SQL injection, XSS) before reaching your app.",
    points: [
      {
        label: "Rules",
        text: "IP reputation, Geo-blocking, rate limiting, string matching, regex patterns",
        easy: "Block bad IPs, block countries, limit requests, detect attacks."
      },
      {
        label: "Integration",
        text: "CloudFront, ALB, API Gateway. Can also protect custom origins",
        easy: "Protect any web app entry point."
      },
      {
        label: "Web ACL",
        text: "Ordered rules. Match first rule wins. Default action allow/block",
        easy: "Like security checklist - first match gets applied."
      },
      {
        label: "Managed Rules",
        text: "AWS maintained rulesets for OWASP Top 10, SQL injection, XSS, bot control",
        easy: "Pre-built rules for common attacks. Like using expert security guards."
      },
      {
        label: "Exam Points",
        text: "WAF vs NACL: WAF for app layer, NACL for network layer. WAF catches logic attacks",
        easy: "NACL blocks traffic, WAF blocks attacks. Both needed!"
      }
    ]
  },
  secrets: {
    title: "AWS Secrets Manager",
    subtitle: "Secrets & Credentials Management",
    easy: "Secrets Manager is secure password safe! Store API keys, DB passwords, secrets. Auto-rotate, audit access.",
    points: [
      {
        label: "Storage",
        text: "Encrypted at rest(KMS). Encrypted in transit(TLS). Never shown in logs",
        easy: "Like super-secure safe. Double-locked, never seen."
      },
      {
        label: "Rotation",
        text: "Auto-rotate every X days. Lambda function for rotation logic. RDS auto-rotation",
        easy: "Automatically change password every 30 days. Like prison guard rotation."
      },
      {
        label: "Access Control",
        text: "IAM policy for who can access. Resource-based policy. Audit with CloudTrail",
        easy: "Only specific people can get secret. Track who accessed when."
      },
      {
        label: "Application Integration",
        text: "SDK support for retrieve at runtime. Not in code/config files",
        easy: "App asks 'give me password' at runtime, not hardcoded."
      },
      {
        label: "Exam Points",
        text: "Secrets Manager vs Parameter Store: Manager for secrets(rotate), Store for config",
        easy: "Secrets = passwords (rotate), Parameters = URLs(don't rotate)."
      }
    ]
  },
  eventbridge: {
    title: "Amazon EventBridge",
    subtitle: "Event Bus & Routing Service",
    easy: "EventBridge is event dispatcher! When X happens, trigger Y. Route AWS events to Lambda, SNS, SQS, etc. automatically.",
    points: [
      {
        label: "Event Sources",
        text: "AWS services(EC2, RDS, CodeBuild), Partner events(Datadog, PagerDuty), Custom apps",
        easy: "Listen to any AWS event or custom event. Like doorbell for everything."
      },
      {
        label: "Rules",
        text: "Pattern matching on event attributes. Target up to 5 targets(fan-out)",
        easy: "If eventType=OrderPlaced AND amount>100, trigger email+Lambda+database."
      },
      {
        label: "Targets",
        text: "Lambda, SNS, SQS, Kinesis, Step Functions, API Gateway, EC2, Batch, etc.",
        easy: "Can route to many places. One event triggers multiple actions."
      },
      {
        label: "Scheduling",
        text: "Cron expressions. Rate(5 minutes). Perfect for scheduled tasks",
        easy: "Run task 'every day at 3am' or 'every 5 minutes'."
      },
      {
        label: "Exam Points",
        text: "EventBridge for event-driven architecture. SNS vs EB: EB more flexible",
        easy: "EventBridge = event dispatcher, SNS = notification. EB more powerful!"
      }
    ]
  },
  cloudtrail: {
    title: "AWS CloudTrail",
    subtitle: "API Activity Logging & Auditing",
    easy: "CloudTrail is security camera for API calls! Records every API call to AWS - who did what when. Required for compliance.",
    points: [
      {
        label: "Logs",
        text: "Management events(default, operations). Data events(S3, Lambda details). Insight events(unusual activity)",
        easy: "Management = 'who deleted the database?'. Data = 'who accessed this file?'. Insight = 'suspicious!'."
      },
      {
        label: "Storage",
        text: "Default 90 days in CloudTrail console. Send to S3 for long-term. Use Athena to query",
        easy: "Console shows 90 days, S3 keeps forever, Athena lets you search."
      },
      {
        label: "Organization Trail",
        text: "Single trail for entire organization. Monitor all accounts centrally",
        easy: "One camera watching all offices simultaneously."
      },
      {
        label: "Protection",
        text: "CloudTrail Integrity. Prevent log tampering. Digest file verification",
        easy: "Lock logs so can't delete/modify. Proof logs authentic."
      },
      {
        label: "Exam Points",
        text: "CloudTrail required for audit. VPC Flow Logs for network traffic. CloudTrail for API calls",
        easy: "CloudTrail = API audit, VPC Flow = network audit. Both needed!"
      }
    ]
  },
  apigw: {
    title: "Amazon API Gateway",
    subtitle: "API Management Service",
    easy: "API Gateway is the front desk! Accepts HTTP requests from customers, routes to backend Lambda/EC2/etc.",
    points: [
      {
        label: "Types",
        text: "REST API: HTTP, flexible. HTTP API: modern, cheaper, faster. WebSocket: real-time",
        easy: "REST old reliable, HTTP faster cheaper, WebSocket for chat/games."
      },
      {
        label: "Integration",
        text: "Lambda, EC2, Kinesis, DynamoDB, SQS, SNS, step functions, mock",
        easy: "Can route to anything. Like restaurant directing customers to kitchen."
      },
      {
        label: "Throttling",
        text: "Prevent abuse. Token bucket algorithm. Rate limiting configurable",
        easy: "Limit requests per second. Like line control at store."
      },
      {
        label: "Caching",
        text: "Cache response by stage. TTL configurable. Reduce backend load",
        easy: "Cache frequent requests. Reduce Lambda calls = save money."
      },
      {
        label: "Exam Points",
        text: "API GW + Lambda = serverless API. CORS needed for browser requests. Usage Plans for metering",
        easy: "API GW = frontend, Lambda = logic. CORS = browser security. Usage = rate limit."
      }
    ]
  }
};

export type ConceptKey = keyof typeof CONCEPTS_EN;
