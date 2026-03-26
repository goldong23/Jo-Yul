# [Conceptualization] Jo:Yul (동아리 조모임 관리 시스템)

| Student No | Name | E-Mail |
| :--- | :--- | :--- |
| 22411923 | 홍주은 | goldong23@ynu.kr |

## [ Revision history]
| Revision date | Version # | Description | Author |
| :--- | :--- | :--- | :--- |
| 2026-03-27 | 1.00 | First draft | 홍주은 |

## Contents
1. Business purpose
2. System context diagram
3. Use case list
4. Concept of operation
5. Problem statement
6. Glossary
7. References

---

## 1. Business purpose

대학 동아리 내에는 다양한 소모임과 프로젝트 조가 존재한다. 특히 IT 학술 동아리인 YUMC의 경우, 부스 준비, 학술 스터디, 개발 프로젝트 등 여러 목적의 조모임이 활발하게 이루어진다. 그러나 학생마다 자바 프로그래밍, 시스템 프로그래밍 등 전공 수업 시간표가 다르고, 개인 일정이 겹쳐 조모임 시간을 정하는 데 큰 어려움을 겪는다. 

기존에는 개별 메신저를 통해 일정을 조율하고 산출물을 공유했으나, 이는 일정 충돌 파악이 어렵고 소스코드나 문서 등 중요 파일이 유실되거나 파편화되는 문제를 낳았다. 

이러한 불편함을 해소하고 동아리 운영진과 조장들이 효율적으로 조모임을 관리할 수 있도록 돕고자 한다. 그리하여 회원의 시간표를 분석하여 최적의 회의 시간을 도출하고, 프로젝트 산출물을 통합 관리하는 프로그램 "YUMC Sync"를 개발하게 되었다. 주 타겟은 원활한 협업과 일정 조율이 필수적인 대학교 학술 동아리 회원 및 운영진이다.

## 2. System context diagram

*(StarUML 등으로 작성한 다이어그램 이미지가 들어갈 자리입니다. 예: `<img src="./images/context_diagram.png">`)*

* **<<actor>> Member**: Login, Registration, InputSchedule, UploadTask, CheckStatus
* **<<actor>> Administrator**: Login, ManageTeam, CheckTotalProgress, Announce
* **System**: MemberStatus, ScheduleData, TaskProgress
* **<<actor>> Server**: uploadMemberTable, uploadTaskTable, downScheduleTable

## 3. Use case list

### 1). Register member & Log-in
| 항목 | 내용 |
| :--- | :--- |
| **Actor** | Member, Administrator |
| **Description** | 동아리 회원은 학번, 이름, 연락처를 기입하여 회원가입을 한다. 등록된 사용자는 로그인을 통해 시스템의 기능(일정 입력, 과제 제출 등)을 사용할 수 있다. [cite_start]관리자 역시 별도의 관리자 계정으로 로그인하여 전체 현황을 파악한다. [cite: 338, 341] |

### 2). Manage Team
| 항목 | 내용 |
| :--- | :--- |
| **Actor** | Administrator |
| **Description** | 관리자(운영진) 또는 조장은 새로운 프로젝트 조를 시스템에 생성하고 소속될 팀원들을 초대하여 구성한다. |

### 3). Input & Recommend Schedule
| 항목 | 내용 |
| :--- | :--- |
| **Actor** | Member, System |
| **Description** | 회원은 자신의 불가 시간(전공 수업 등)을 시스템에 입력한다. 시스템은 조원들의 일정을 교차 분석하여 전원이 참석 가능한 최적의 회의 시간을 추천한다. |

### 4). Upload Task
| 항목 | 내용 |
| :--- | :--- |
| **Actor** | Member |
| **Description** | 회원은 주차별로 할당된 업무(예: Java 소스코드 작성, 보안 관련 논문 요약 등) 결과물을 시스템에 업로드하고 진행 상태(진행 중, 완료 등)를 업데이트한다. |

## 4. Concept of operation

### 1). Register member & Log-in
| 항목 | 내용 |
| :--- | :--- |
| **Purpose** | [cite_start]인가된 동아리 회원만 시스템을 이용하도록 제한함. [cite: 362, 364] |
| **Approach** | 학번을 ID로 사용하여 중복 가입을 방지한다. [cite_start]DB에 등록된 정보와 일치해야만 로그인이 승인되며, 세션이 유지되는 동안만 기능 사용이 가능하다. [cite: 362, 364] |
| **Dynamics** | [cite_start]시스템의 세부 기능을 이용하고자 할 때 접근한다. [cite: 362, 364] |
| **Goals** | [cite_start]사용자 인증을 통한 보안 유지 및 개인화된 일정 관리 제공. [cite: 362, 364] |

### 2). Input & Recommend Schedule
| 항목 | 내용 |
| :--- | :--- |
| **Purpose** | 조원 간의 일정 조율에 소모되는 시간을 최소화함. |
| **Approach** | 캘린더 형태의 UI를 제공하여 드래그 앤 드롭으로 불가능한 시간을 블록 처리한다. 시스템은 교집합 연산을 통해 가능한 시간을 도출해 낸다. |
| **Dynamics** | 학기 초반 조가 구성되고 정기 모임 시간을 확정해야 할 때 사용한다. |
| **Goals** | 모두가 동의할 수 있는 모임 시간을 시스템이 객관적으로 제시함. |

### 3). Upload Task
| 항목 | 내용 |
| :--- | :--- |
| **Purpose** | 조별 프로젝트 산출물과 각 팀원의 기여도를 체계적으로 관리함. |
| **Approach** | 게시판 형식의 UI에서 파일 첨부 및 텍스트 입력을 지원한다. 제출된 과제는 서버 스토리지에 저장되며, 담당자의 진행 상태 바가 갱신된다. |
| **Dynamics** | 주간 목표에 따른 개인 할 일을 완료했을 때 사용한다. |
| **Goals** | 무임승차를 방지하고 프로젝트 진행 상황의 투명성을 확보함. |

## 5. Problem statement

[cite_start]YUMC Sync의 Problem Statement는 아래와 같다. [cite: 396]

1. 실제 외부 메일 서버(SMTP)를 연동하지 않고 내부 알림(시스템 알림)으로 우선 대체한다. 이메일 전송 실패로 인한 시스템 지연을 방지하기 위함이다.
2. 클라우드 스토리지를 대규모로 구축하기 전이므로, 초기 프로토타입에서는 텍스트 및 저용량 소스코드 파일 위주의 업로드만 지원하며 대용량 영상 파일 업로드는 제한한다.
3. [cite_start]인터넷이 연결되어 있지 않으면 시스템에 접속하여 일정을 동기화하거나 과제를 업로드할 수 없다. [cite: 399]

## 6. Glossary

| Terms | Description |
| :--- | :--- |
| **조장** | 생성된 프로젝트 조의 리더 역할을 수행하며, 팀원 초대 및 일정 확정 권한을 가진다. |
| **산출물** | 스터디나 프로젝트를 통해 생성된 소스코드(.java, .c 등), 요약 문서, 발표 자료를 포괄하여 이르는 말이다. |
| **블록 처리** | 캘린더 UI 상에서 본인이 참석 불가능한 시간대를 클릭 혹은 드래그하여 시스템에 불가 시간으로 인식시키는 행위이다. |

## 7. References
1) YUMC 동아리 회칙 및 운영 지침
