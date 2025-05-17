# 实现一个 On-Chain-Buidlerboard | Day 0x01

> Web2 版本 Buidlerboard 入口：
>
> https://buidlerboard.bewater.pro

在过去关于 #BeWater 的文章中，我们曾经提到 [设计「众人维护」的 BuidlerBoard](https://mp.weixin.qq.com/s/KUTcz4xrlhSdckQnLSsqsg)。

其中提到 Buidlerboard 的未来发展方向：

* 项目提交入口（已实现）
* 划分出 Github BuidlerBoard 和 BeWater Projects BuidlerBoard 两个版本（TODO）
* 算法更新（TODO）
* **链上化**

正好当前 Dorahack Aptos Grant 到达  Round 8：

> https://dorahacks.io/aptos

![image-20250509232229252](https://p.ipic.vip/yqj721.png)

借这个机会，我正好给大家 **「直播」** 我 Buidl 一个 Hackathon 项目的过程。

> **原则**
>
> 依旧遵循一直以来的原则：**即使是 Hackathon 也一定做的是本来就在自己规划中的项目，不要变成 Hackathon Hunter。** 因为 Hackathon 的不确定性太大了。

## 0x01 核心思考🤔

### 1.1 Why Buidlerboard?

相对于功能更复杂的 Hackathon Platform 来说，Buidlerboard 更符合 Hackathon Hodlers、Buidlers 和 Sponsors 的**「刚需」**。

> **问：** Hackathon Hodlers、Buidlers 和 Sponsors 的「1st 刚需」分别什么？
>
> 1st 刚需 —— 在需求里面最重要的那 **一** 个。

### 1.2 Why On-Chain?

实践一个链上的 Buidlerboard 有很多好处：

1/ 不再存在传统 Web2 App 的数据丢失风险，实现与创建人解耦的 **「数据永存」**。

2/ 可以与其他合约进行链上交互，提供「乐高积木式」的可组合玩法，发挥 **DevGC** 的想象空间。

此外，这也是一个很好的实例，展现基于传统数据库的应用是如何向 Web3 dApp 进行迁移的。

## 0x02 从 Web2 App 到 Web3 dApp

Buidlerboard 是很典型的链改应用。我们通过两张图来来看看变化。

原有的 App 架构：

```bash
   +--------------------+
   | Frontend on Vercel |
   +--------------------+
              ↕
+--------------------------+
| Typescript Funcs on Deno |
+--------------------------+
        ↕          ↑
  +-----------+    | Common
  | SQL Funcs |    | CRUD
  +-----------+    |
        ↕          ↓
+-----------------------+
| Projects | Hackathons |
+-----------------------+
| Database on Supabase  |
+-----------------------+
```

这也是非常适合独立开发者的一种低成本的 App 架构……之后会专门开文章或者专栏来阐述在这个架构下的开发实践🌹。

在向链上迁移之后：

```bash
          +--------+  +--------------------+
          |  APIs  |  | Frontend on Vercel |
          +--------+  +--------------------+
              ↕ Interact        ↑
+--------------------------+    | Interact
| Typescript Funcs on Deno |    |
+--------------------------+    |
              ↕↕↕ Interact      ↓
  +-----------+ +------------+ +-----------------+
  | Init Func | | View Funcs | | Pub Entry Funcs | Smart Contract Funcs
  +-----------+ +------------+ +-----------------+
        ↓ init       ↓ Read      ↓ CW
+--------------------------------+       
| Projects Aggr | Hackathon Aggr |
+--------------------------------+
|    Projects    |   Hackathons  |
+--------------------------------+
|  Structs on Aptos Framework    |
+--------------------------------+
```

我们进行了如下变动：

* **Database => Struct on Aptos**

  从传统数据库中的表迁移为 Aptos 中的结构体。

* **SQL Funcs & Typescript Funcs => Smart Contract Funcs** 

  从传统的后端函数迁移为智能合约中的函数。

  > **💡 Aptos 中的函数**
  >
  > private - Move 中的函数默认为私有函数（这意味着它们只能在同一模块内调用，模块外部的其他模块和脚本无法访问）。
  >
  > public - 公共函数可以被任何模块或脚本中的任何函数调用。
  >
  > public(friend) - 公共函数可以被同一模块中的任何函数以及在友元列表中明确定义的模块函数调用。
  >
  > entry - 入口函数，也即外部可调。
  >
  > 
  >
  > view - 还可以给 public 函数加上 view 修饰符，这样的话是外部可调用的只读函数。

* **Typescript Funcs on Deno**

  依然保留 Deno Funcs 这一设计，一方面提供某些场景下需要的后端能力，例如一些链下计算；另一方面在有需要时为托管用户提供服务。

* **Frontend on Vercel**

  前端从和后端交互转变为和合约交互，这里我们在代码上参考`scaffold-move`：

  > https://github.com/NonceGeek/scaffold-move

## 0x03 知识点：结构体、能力与对象

在这里补充一些关于 Aptos 的基础知识：

💡**Aptos 中的结构体（Struct）**

在 Move 中，结构体是用户自定义的数据类型，用于封装相关字段。默认情况下，结构体具有线性和临时性，意味着它们不能被复制、丢弃或存储在全局存储中，除非显式赋予特定能力。



💡**能力（Abilities）**

结构体可以通过以下能力进行注解，以控制其行为：

- **copy**：允许实例被复制。
- **drop**：允许实例在超出作用域时被丢弃。
- **store**：允许实例存储在全局存储中。
- **key**：将结构体标记为全局存储操作的键，允许其在全局范围内存储和访问。

例如，定义一个结构体 `struct MyStruct has key, store { ... }`，即可将其实例存储在全局存储中，并作为访问资源的键使用。

如果未赋予这些能力，结构体将仅限于其定义的模块内使用，无法在全局范围内存储或操作。



💡**对象（Object）**

Aptos 引入了对象模型，使得 Move 能够将一组不同的复杂类型表示为存储在单个地址中的资源集合。

对象模型的核心结构为 ObjectCore，其定义如下：

```rust
struct ObjectCore has key {
    guid_creation_num: u64,
    owner: address,
    allow_ungated_transfer: bool,
    transfer_events: event::EventHandle<TransferEvent>,
}
```

* **guid_creation_num**：唯一标识符。
* **owner**：所有者的地址（可以是对象或账户）。
* **allow_ungated_transfer**：布尔值，指示对象是否允许转移。
* **transfer_events**：每当发生转移时发出的事件句柄。 

通过这种方式，对象可以包含各种元素，例如 NFT、代币和游戏中的玩家对象等专用数据结构。

## 0x04 合约实现

首先来实现一版合约，先有数据结构和最基础的函数。

源码地址：

> https://github.com/BeWaterXYZ/BuidlerBoard-Move/tree/main/contracts

> 💡我的习惯是将合约复制到 aptos 官方仓库下的`aptos-core/aptos-move/move-examples` 这个目录里进行开发，开发完之后再复制回原仓库。这样的话有大量官方示例合约代码和自己写过的所有合约代码，对 AI 编程非常友好。

### 4.1 设计结构体

```rust
 //:!:>resource
  struct Hackathon has key, store, drop, copy {
      unique_id: u64,
      // only owner can update the hackathon.
      owner: address,
      name: string::String,
      description: string::String,
      start_date: u64,
      end_date: u64,
      winners: vector<u64>,
      comments: vector<string::String>,
  }

  struct HackathonAggregator has key {
      max_id: u64,
      hackathons: vector<Hackathon>,
      // add_hackathon_events: event::EventHandle<AddHackathonEvent>,
      // update_hackathon_events: event::EventHandle<UpdateHackathonEvent>
  }

  struct ProjectAggregator has key {
      max_id: u64,
      projects: vector<Project>,
      // add_project_events: event::EventHandle<AddProjectEvent>,
      // update_project_events: event::EventHandle<UpdateProjectEvent>
  }

  struct Project has key, store, drop, copy {
      // basic info
      unique_id: u64,
      name: string::String,
      category: string::String,
      github_url: string::String,
      owner: address,
      created_at: u64,
      updated_at: u64,

      // more info
      demo_url: string::String,
      deck_url: string::String,
      intro_video_url: string::String,

      // activities
      activities: vector<Hackathon>,
  }
  //<:!:resource
```

定义了 `Hackathon` 和 `Project` 两个结构体，相当于传统数据库中的表结构。

然后定义了 `HackathonAggregator` 与 `ProjectAggregator`，用于存储 `Hackathons` 和 `Projects`。

### 4.2 初始化函数

```rust
    //:!:>init
    // This is only callable during publishing.
    fun init_module(account: &signer) {
        move_to(account, HackathonAggregator {
            max_id: 0,
            hackathons: vector::empty(),
        });
        move_to(account, ProjectAggregator {
            max_id: 0,
            projects: vector::empty(),
        });
    }
    //<:!:init
```

在这个函数里我们初始化 `HackathonAggregator` 和 `ProjectAggregator`，并将其转移到合约账号下。和 EVM 体系不同，在 Aptos 中合约账号即部署者的账号。

### 4.3 只读函数

```rust
		// :!:>view
    #[view]
    public fun get_hackathons_max_id(): u64 acquires HackathonAggregator {
        borrow_global<HackathonAggregator>(@my_addr).max_id
    }

    #[view]
    public fun get_hackathons(): vector<Hackathon> acquires HackathonAggregator {
        borrow_global<HackathonAggregator>(@my_addr).hackathons
    }

    #[view]
    public fun get_hackathon(unique_id: u64): Hackathon acquires HackathonAggregator {
        borrow_global<HackathonAggregator>(@my_addr).hackathons[unique_id]
    }

    #[view]
    public fun get_projects_max_id(): u64 acquires ProjectAggregator {
        borrow_global<ProjectAggregator>(@my_addr).max_id
    }

    #[view]
    public fun get_projects(): vector<Project> acquires ProjectAggregator {
        borrow_global<ProjectAggregator>(@my_addr).projects
    }

    #[view]
    public fun get_project(unique_id: u64): Project acquires ProjectAggregator {
        borrow_global<ProjectAggregator>(@my_addr).projects[unique_id]
    }
    //<:!:view
```

通过只读函数可以拿到全部的  `hackathons` 和  `projects` 数据，以及通过 unique_id 拿到单个的 `hackathon` 和 `project` 数据。

### 4.4 public entry 函数

也就是可以被外部调用的函数：

```rust
   //:!:>entry fun
    
    // Add a hackathon to the buidlerboard.
    public entry fun add_hackathon(
        account: &signer, 
        name: string::String, 
        description: string::String, 
        start_date: u64, 
        end_date: u64) acquires HackathonAggregator {
        let hackathon_aggr = borrow_global_mut<HackathonAggregator>(@my_addr);
        hackathon_aggr.max_id = hackathon_aggr.max_id + 1;
        hackathon_aggr.hackathons.push_back(Hackathon {
            unique_id: hackathon_aggr.max_id,
            name: name,
            description: description,
            owner: signer::address_of(account),
            start_date: start_date,
            end_date: end_date,
            winners: vector::empty(),
            comments: vector::empty(),
        });
    }

    // Add a project to the buidlerboard.

    public entry fun add_project(
        account: &signer, 
        name: string::String, 
        category: string::String,
        github_url: string::String, 
        demo_url: string::String, 
        deck_url: string::String, 
        intro_video_url: string::String) acquires ProjectAggregator {
        let project_aggr = borrow_global_mut<ProjectAggregator>(@my_addr);
        project_aggr.max_id = project_aggr.max_id + 1;
        project_aggr.projects.push_back(Project {
            unique_id: project_aggr.max_id,
            name: name,
            category: category,
            github_url: github_url,
            owner: signer::address_of(account),
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
            demo_url: demo_url,
            deck_url: deck_url,
            intro_video_url: intro_video_url,
            activities: vector::empty(),
        });
    }
    //<:!:entry fun
```

这里的实现有几点需要注意：

* `borrow_global_mut`：从合约账户下把 `*Aggregator` 给借了出来。
* 设置 `owner`：给每个 `Project` 和 `Hackathon` 都设置个 `owner`，这样便于后续做更新操作的时候进行权限鉴别。

## 0x05 合约部署与调用调试

我的习惯是用命令行进行编译和部署，然后通过浏览器进行调用调试。

* 创建测试账号：

   ```bash
    aptos init --profile [profile_name]
   ```

* 编译合约：

  ```bash
  aptos move compile --package-dir ./buidlerboard  --named-addresses my_addr=[profile_name]
  ```

  ![image-20250510191913431](https://p.ipic.vip/gfjqvp.png)

* 部署合约：

  ```bash
  aptos move publish --package-dir ./buidlerboard --named-addresses my_addr=[profile_name] --profile [profile_name]
  ```

  ![image-20250510192013120](https://p.ipic.vip/gr9e34.png)

然后我们打开浏览器访问，就能在浏览器中直接和合约进行交互了！

> https://explorer.aptoslabs.com/account/0x2378e31bc26587e1f9cec5afbc1b5abe92833c4eab9e184b3678e3635e505d9f/modules/run/buidlerboard/add_project?network=testnet



