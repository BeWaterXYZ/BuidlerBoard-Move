module github_score_addr::github_score {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::object::{Self, Object};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use std::vector;
    use aptos_std::table::{Self, Table};

    /// 错误码
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_SCORE_NOT_FOUND: u64 = 2;
    const E_PROFILE_NOT_FOUND: u64 = 3;
    const ERROR_PROJECT_NOT_FOUND: u64 = 4;
    const ERROR_ALREADY_ENDORSED: u64 = 5;

    /// Collection 名称
    const COLLECTION_NAME: vector<u8> = b"Builder Board Badges";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Achievement badges for outstanding developers";
    const COLLECTION_URI: vector<u8> = b"https://builder-board.com/badges";

    /// 徽章类型
    const BADGE_STAR_CONTRIBUTOR: u8 = 1;  // 明星贡献者
    const BADGE_ACTIVE_DEVELOPER: u8 = 2;  // 活跃开发者
    const BADGE_COMMUNITY_LEADER: u8 = 3;  // 社区领袖
    const BADGE_CODE_MASTER: u8 = 4;       // 代码大师

    // 项目徽章
    const BADGE_TRENDING_PROJECT: u8 = 5;  // 热门项目
    const BADGE_INNOVATIVE_TECH: u8 = 6;   // 创新技术
    const BADGE_COMMUNITY_CHOICE: u8 = 7;  // 社区之选
    const BADGE_HIGH_IMPACT: u8 = 8;       // 高影响力

    /// 开发者分数记录
    struct DeveloperScore has key {
        github_id: String,
        login: String,
        score: u64,
        total_stars: u64,
        followers: u64,
        timestamp: u64,
    }

    /// 项目分数记录
    struct ProjectScore has key {
        github_id: String,
        name: String,
        score: u64,
        stars: u64,
        forks: u64,
        timestamp: u64,
    }

    /// 徽章结构
    struct Badge has store, drop {
        badge_type: u8,
        name: String,
        issue_time: u64,
    }

    /// 背书记录
    struct Endorsement has store, drop {
        from: address,
        message: String,
        timestamp: u64,
    }

    /// 开发者个人资料
    struct DeveloperProfile has key {
        github_id: String,
        login: String,
        score: u64,
        total_stars: u64,
        followers: u64,
        timestamp: u64,
        badges: vector<Badge>,         // 成就徽章
        endorsements: vector<Endorsement>, // 修改为存储完整的背书记录
        reputation: u64,               // 声誉分数
    }

    /// 分数更新事件
    struct ScoreUpdateEvent has drop, store {
        github_id: String,
        score: u64,
        timestamp: u64,
    }

    /// 事件句柄存储
    struct EventStore has key {
        developer_score_events: event::EventHandle<ScoreUpdateEvent>,
        project_score_events: event::EventHandle<ScoreUpdateEvent>,
    }

    struct BadgeCollection has key {
        collection_name: String,
        minting_enabled: bool,
        token_counter: u64,
    }

    // 新增项目背书结构
    struct ProjectEndorsement has store, drop {
        from: address,
        message: String,
        timestamp: u64,
    }

    // 新增项目结构
    struct Project has key {
        id: String,
        name: String,
        score: u64,
        stars: u64,
        forks: u64,
        endorsements: vector<ProjectEndorsement>,
        last_update_time: u64,
    }

    /// 存储所有分数数据的结构
    struct ScoreStore has key {
        developers: Table<String, DeveloperScore>,
        projects: Table<String, ProjectScore>,
    }

    /// 初始化模块
    fun init_module(sender: &signer) {
        move_to(sender, EventStore {
            developer_score_events: account::new_event_handle<ScoreUpdateEvent>(sender),
            project_score_events: account::new_event_handle<ScoreUpdateEvent>(sender),
        });

        // 创建徽章集合
        collection::create_unlimited_collection(
            sender,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_NAME),
            option::none(),
            string::utf8(COLLECTION_URI),
        );

        move_to(sender, BadgeCollection {
            collection_name: string::utf8(COLLECTION_NAME),
            minting_enabled: true,
            token_counter: 0,
        });

        move_to(sender, ScoreStore {
            developers: table::new(),
            projects: table::new(),
        });
    }

    /// 提交开发者分数
    public entry fun submit_developer_score(
        sender: &signer,
        github_id: String,
        login: String,
        score: u64,
        total_stars: u64,
        followers: u64,
        timestamp_sec: u64,
    ) acquires EventStore, ScoreStore {
        assert!(signer::address_of(sender) == @github_score_addr, E_NOT_AUTHORIZED);
        
        let score_store = borrow_global_mut<ScoreStore>(@github_score_addr);
        let developer_score = DeveloperScore {
            github_id,
            login,
            score,
            total_stars,
            followers,
            timestamp: timestamp_sec,
        };

        if (table::contains(&score_store.developers, github_id)) {
            let _old_score = table::remove(&mut score_store.developers, github_id);
        };
        table::add(&mut score_store.developers, github_id, developer_score);

        let event_store = borrow_global_mut<EventStore>(@github_score_addr);
        event::emit_event(&mut event_store.developer_score_events, ScoreUpdateEvent {
            github_id,
            score,
            timestamp: timestamp_sec,
        });
    }

    /// 提交项目分数
    public entry fun submit_project_score(
        sender: &signer,
        github_id: String,
        name: String,
        score: u64,
        stars: u64,
        forks: u64,
        timestamp_sec: u64,
    ) acquires EventStore, ScoreStore {
        assert!(signer::address_of(sender) == @github_score_addr, E_NOT_AUTHORIZED);
        
        let score_store = borrow_global_mut<ScoreStore>(@github_score_addr);
        let project_score = ProjectScore {
            github_id,
            name,
            score,
            stars,
            forks,
            timestamp: timestamp_sec,
        };

        if (table::contains(&score_store.projects, github_id)) {
            let _old_score = table::remove(&mut score_store.projects, github_id);
        };
        table::add(&mut score_store.projects, github_id, project_score);

        let event_store = borrow_global_mut<EventStore>(@github_score_addr);
        event::emit_event(&mut event_store.project_score_events, ScoreUpdateEvent {
            github_id,
            score,
            timestamp: timestamp_sec,
        });
    }

    /// 获取开发者分数
    public fun get_developer_score(github_id: String): u64 acquires ScoreStore {
        let score_store = borrow_global<ScoreStore>(@github_score_addr);
        assert!(table::contains(&score_store.developers, github_id), E_SCORE_NOT_FOUND);
        let score = table::borrow(&score_store.developers, github_id);
        score.score
    }

    /// 获取项目分数
    public fun get_project_score(github_id: String): u64 acquires ScoreStore {
        let score_store = borrow_global<ScoreStore>(@github_score_addr);
        assert!(table::contains(&score_store.projects, github_id), E_SCORE_NOT_FOUND);
        let score = table::borrow(&score_store.projects, github_id);
        score.score
    }

    /// 添加背书 - 任何人都可以调用
    public entry fun endorse_developer(
        from: &signer,
        to: address,
        message: String
    ) acquires DeveloperProfile {
        let from_addr = signer::address_of(from);
        assert!(exists<DeveloperProfile>(to), E_PROFILE_NOT_FOUND);
        assert!(from_addr != to, 0); // 不能给自己背书
        
        let profile = borrow_global_mut<DeveloperProfile>(to);
        let endorsement = Endorsement {
            from: from_addr,
            message,
            timestamp: timestamp::now_seconds(),
        };
        
        vector::push_back(&mut profile.endorsements, endorsement);
        profile.reputation = profile.reputation + 1;
    }

    /// 获取开发者背书列表
    #[view]
    public fun get_developer_endorsements(addr: address): vector<Endorsement> acquires DeveloperProfile {
        let profile = borrow_global<DeveloperProfile>(addr);
        profile.endorsements
    }

    /// 发放成就徽章 NFT
    public entry fun award_badge(
        admin: &signer,
        to: address,
        badge_type: u8
    ) acquires BadgeCollection {
        assert!(signer::address_of(admin) == @github_score_addr, E_NOT_AUTHORIZED);
        
        let badge_collection = borrow_global_mut<BadgeCollection>(@github_score_addr);
        assert!(badge_collection.minting_enabled, E_NOT_AUTHORIZED);

        let counter = badge_collection.token_counter + 1;
        let badge_name = get_badge_name(badge_type);
        let description = get_badge_description(badge_type);
        let uri = get_badge_uri(badge_type);

        // 铸造徽章 NFT
        let constructor_ref = token::create_named_token(
            admin,
            badge_collection.collection_name,
            description,
            badge_name,
            option::none(),
            uri,
        );

        // 转移给接收者
        let token_signer = object::generate_signer(&constructor_ref);
        token::direct_transfer(admin, &token_signer, to, object::object_from_constructor_ref(&constructor_ref));

        badge_collection.token_counter = counter;
    }

    /// 获取徽章名称
    fun get_badge_name(badge_type: u8): String {
        if (badge_type == BADGE_STAR_CONTRIBUTOR) {
            string::utf8(b"Star Contributor")
        } else if (badge_type == BADGE_ACTIVE_DEVELOPER) {
            string::utf8(b"Active Developer")
        } else if (badge_type == BADGE_COMMUNITY_LEADER) {
            string::utf8(b"Community Leader")
        } else if (badge_type == BADGE_CODE_MASTER) {
            string::utf8(b"Code Master")
        } else if (badge_type == BADGE_TRENDING_PROJECT) {
            string::utf8(b"Trending Project")
        } else if (badge_type == BADGE_INNOVATIVE_TECH) {
            string::utf8(b"Innovative Technology")
        } else if (badge_type == BADGE_COMMUNITY_CHOICE) {
            string::utf8(b"Community Choice")
        } else if (badge_type == BADGE_HIGH_IMPACT) {
            string::utf8(b"High Impact")
        } else {
            string::utf8(b"Unknown Badge")
        }
    }

    /// 获取徽章描述
    fun get_badge_description(badge_type: u8): String {
        if (badge_type == BADGE_STAR_CONTRIBUTOR) {
            string::utf8(b"Awarded to developers with exceptional contributions")
        } else if (badge_type == BADGE_ACTIVE_DEVELOPER) {
            string::utf8(b"Recognized for consistent and active development")
        } else if (badge_type == BADGE_COMMUNITY_LEADER) {
            string::utf8(b"Leading and inspiring the developer community")
        } else if (badge_type == BADGE_CODE_MASTER) {
            string::utf8(b"Mastery in code quality and technical excellence")
        } else if (badge_type == BADGE_TRENDING_PROJECT) {
            string::utf8(b"Rapidly growing project with strong momentum")
        } else if (badge_type == BADGE_INNOVATIVE_TECH) {
            string::utf8(b"Project pushing technological boundaries")
        } else if (badge_type == BADGE_COMMUNITY_CHOICE) {
            string::utf8(b"Highly endorsed by the community")
        } else if (badge_type == BADGE_HIGH_IMPACT) {
            string::utf8(b"Project making significant ecosystem impact")
        } else {
            string::utf8(b"Special achievement badge")
        }
    }

    /// 获取徽章URI
    fun get_badge_uri(badge_type: u8): String {
        let base_uri = string::utf8(b"https://builder-board.com/api/badges/");
        string::append(&mut base_uri, num_to_string(badge_type));
        base_uri
    }

    fun num_to_string(num: u8): String {
        if (num == 0) {
            return string::utf8(b"0")
        };
        let res = string::utf8(b"");
        let n = num;
        while (n > 0) {
            let digit = ((48 + n % 10) as u8);
            string::insert(&mut res, 0, digit);
            n = n / 10;
        };
        res
    }

    #[test_only]
    /// 测试初始化函数
    public fun initialize_for_test(sender: &signer) {
        init_module(sender);
    }

    // 项目背书函数
    public entry fun endorse_project(
        endorser: &signer,
        project_id: String,
        message: String,
    ) acquires Project {
        let endorser_addr = std::signer::address_of(endorser);
        
        // 确保项目存在
        assert!(exists<Project>(@admin), ERROR_PROJECT_NOT_FOUND);
        let project = borrow_global_mut<Project>(@admin);
        assert!(project.id == project_id, ERROR_PROJECT_NOT_FOUND);
        
        // 检查是否已经背书过
        let i = 0;
        let len = vector::length(&project.endorsements);
        while (i < len) {
            let endorsement = vector::borrow(&project.endorsements, i);
            assert!(endorsement.from != endorser_addr, ERROR_ALREADY_ENDORSED);
            i = i + 1;
        };
        
        // 添加新背书
        let endorsement = ProjectEndorsement {
            from: endorser_addr,
            message,
            timestamp: timestamp::now_seconds(),
        };
        vector::push_back(&mut project.endorsements, endorsement);
    }

    // 获取项目背书列表
    #[view]
    public fun get_project_endorsements(project_id: String): vector<ProjectEndorsement> acquires Project {
        let project = borrow_global<Project>(@admin);
        assert!(project.id == project_id, ERROR_PROJECT_NOT_FOUND);
        project.endorsements
    }
} 