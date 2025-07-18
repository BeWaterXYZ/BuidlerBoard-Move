module my_addr::buidlerboard_v2 {
    // use std::error;
    use std::signer;
    use std::string;
    use std::vector;
    use std::table::{Self, Table};

    use aptos_framework::timestamp;
    use aptos_framework::account;
    
    use aptos_framework::event::{Self, EventHandle};
    

    #[test_only]
    use std::debug;

    const ERR_NOT_OWNER: u64 = 1001;

    //:!:> event resource
    // TODO: impl the event in the entry fun.
    struct AddHackathonEvent has drop, store {
        unique_id: u64,
        name: string::String,
        description: string::String,
        start_date: u64,
        end_date: u64,
    }

    struct AddHackathonEventSet has key, store {
        add_hackathon_events: EventHandle<AddHackathonEvent>,
    }

    struct AddProjectEvent has drop, store {
        unique_id: u64,
        name: string::String,
        category: string::String,
        github_url: string::String,
        demo_url: string::String,
        deck_url: string::String,
        intro_video_url: string::String,
    }



    struct AddProjectEventSet has key, store {
        add_project_events: EventHandle<AddProjectEvent>,
    }

    struct AddCommentEventSet has key, store {
        add_project_comment_events: EventHandle<AddProjectCommentEvent>,
        add_hackathon_comment_events: EventHandle<AddHackathonCommentEvent>,
    }

    struct AddProjectCommentEvent has copy, drop, store {
        project_unique_id: u64,
        comment: string::String,
        comment_owner: address,
    }

    struct AddHackathonCommentEvent has copy, drop, store {
        comment: string::String,
        comment_owner: address,
    }


    // <:!: event resource

    //:!:> normal resource
    struct Hackathon has key, store, drop, copy {
        unique_id: u64,
        // only owner can update the hackathon.
        owner: address,
        name: string::String,
        description: string::String,
        start_date: u64,
        end_date: u64,
        judges: vector<address>,
        winners: vector<u64>,
        comments: vector<string::String>,
        projects: vector<u64>
    }

    struct HackathonAggregator has key {
        max_id: u64,
        hackathons: Table<u64, Hackathon>,
        add_comment_event_set: Table<u64, AddCommentEventSet>,
        add_hackathon_events: event::EventHandle<AddHackathonEvent>
        // update_hackathon_events: event::EventHandle<UpdateHackathonEvent>
    }

    struct ProjectAggregator has key {
        max_id: u64,
        projects: Table<u64, Project>,
        add_project_events: event::EventHandle<AddProjectEvent>,
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
        activities: vector<u64>,
    }
    //<:!: normal resource


    //:!:>init
    // This is only callable during publishing.
    fun init_module(account: &signer) {
        move_to(account, HackathonAggregator {
            max_id: 0,
            hackathons: table::new(),
            add_comment_event_set: table::new(),
            add_hackathon_events: account::new_event_handle<AddHackathonEvent>(account),

        });
        move_to(account, ProjectAggregator {
            max_id: 0,
            projects: table::new(),
            add_project_events: account::new_event_handle<AddProjectEvent>(account),
        });
    }
    //<:!:init

    // :!:>view
    #[view]
    public fun get_hackathons_max_id(): u64 acquires HackathonAggregator {
        borrow_global<HackathonAggregator>(@my_addr).max_id
    }

    #[view]
    public fun get_hackathons(): vector<Hackathon> acquires HackathonAggregator {
        let hackathon_aggr = borrow_global<HackathonAggregator>(@my_addr);
        let hackathons = vector::empty<Hackathon>();
        let i = 0;
        while (i < hackathon_aggr.max_id) {
            vector::push_back(&mut hackathons, *table::borrow(&hackathon_aggr.hackathons, i));
            i = i + 1;
        };
        hackathons
    }

    #[view]
    public fun get_hackathon(unique_id: u64): Hackathon acquires HackathonAggregator {
        let hackathon_aggr = borrow_global<HackathonAggregator>(@my_addr);
        *table::borrow(&hackathon_aggr.hackathons, unique_id)
    }

    #[view]
    public fun get_projects_max_id(): u64 acquires ProjectAggregator {
        borrow_global<ProjectAggregator>(@my_addr).max_id
    }

    #[view]
    public fun get_projects(): vector<Project> acquires ProjectAggregator {
        let project_aggr = borrow_global<ProjectAggregator>(@my_addr);
        let projects = vector::empty<Project>();
        let i = 0;
        while (i < project_aggr.max_id) {
            vector::push_back(&mut projects, *table::borrow(&project_aggr.projects, i));
            i = i + 1;
        };
        projects
    }

    #[view]
    public fun get_project(unique_id: u64): Project acquires ProjectAggregator {
        let project_aggr = borrow_global<ProjectAggregator>(@my_addr);
        *table::borrow(&project_aggr.projects, unique_id)
    }
    //<:!:view


    //:!:>entry fun
    
    // Add a hackathon to the buidlerboard.
    public entry fun add_hackathon(
        account: &signer, 
        name: string::String, 
        description: string::String, 
        start_date: u64, 
        end_date: u64) acquires HackathonAggregator {
        let hackathon_aggr = borrow_global_mut<HackathonAggregator>(@my_addr);

        table::add(&mut hackathon_aggr.hackathons, hackathon_aggr.max_id, Hackathon {
            unique_id: hackathon_aggr.max_id,
            name: name,
            description: description,
            owner: signer::address_of(account),
            start_date: start_date,
            end_date: end_date,
            judges: vector::empty(),
            winners: vector::empty(),
            comments: vector::empty(),
            projects: vector::empty()
        });

        // update the max id after add the hackathon.
        hackathon_aggr.max_id = hackathon_aggr.max_id + 1;

        // // emit event
        // event::emit_event<AddHackathonEvent>(
        //     &mut borrow_global_mut<AddHackathonEventSet>(@my_addr).add_hackathon_events,
        //     AddHackathonEvent {
        //         unique_id: hackathon_aggr.max_id,
        //         name: name,
        //         description: description,
        //         start_date: start_date,
        //         end_date: end_date,
        //     }
        // );
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
        
        table::add(&mut project_aggr.projects, project_aggr.max_id, Project {
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

        // update the max id after add the project.
        project_aggr.max_id = project_aggr.max_id + 1;

        // emit event
        // event::emit_event<AddProjectEvent>(
        //     &mut borrow_global_mut<AddProjectEventSet>(@my_addr).add_project_events,
        //     AddProjectEvent {
        //         unique_id: project_aggr.max_id,
        //         name: name,
        //         category: category,
        //         github_url: github_url,
        //         demo_url: demo_url,
        //         deck_url: deck_url,
        //         intro_video_url: intro_video_url,
        //     }
        // );
    }

    public entry fun update_project(
        account: &signer,
        project_unique_id: u64,
        name: string::String,
        category: string::String,
        github_url: string::String,
        demo_url: string::String,
        deck_url: string::String,
        intro_video_url: string::String
    ) acquires ProjectAggregator {
        let project_aggr = borrow_global_mut<ProjectAggregator>(@my_addr);
        let project = table::borrow_mut(&mut project_aggr.projects, project_unique_id);

        // Check if the account is the owner of the project
        assert!(project.owner == signer::address_of(account), ERR_NOT_OWNER);

        project.name = name;
        project.category = category;
        project.github_url = github_url;
        project.demo_url = demo_url;
        project.deck_url = deck_url;
        project.intro_video_url = intro_video_url;
        project.updated_at = timestamp::now_seconds();
    }

    // Only project owner can add project to hackathon.
    public entry fun add_project_to_hackathon(
        account: &signer,
        project_unique_id: u64,
        hackathon_unique_id: u64
    ) acquires ProjectAggregator, HackathonAggregator {
        let project_aggr = borrow_global_mut<ProjectAggregator>(@my_addr);
        let hackathon_aggr = borrow_global_mut<HackathonAggregator>(@my_addr);

        let project = table::borrow_mut(&mut project_aggr.projects, project_unique_id);
        let hackathon = table::borrow_mut(&mut hackathon_aggr.hackathons, hackathon_unique_id);

        // Check if the account is the owner of the project
        assert!(project.owner == signer::address_of(account), 1);

        // link the project & the hackathon
        vector::push_back(&mut project.activities, hackathon_unique_id);
        vector::push_back(&mut hackathon.projects, project_unique_id);
    }

    // Only hackathon owner can add judges.
    public entry fun add_judges(
        account: &signer,
        hackathon_unique_id: u64,
        judges: vector<address>
    ) acquires HackathonAggregator {
        let hackathon_aggr = borrow_global_mut<HackathonAggregator>(@my_addr);
        let hackathon = table::borrow_mut(&mut hackathon_aggr.hackathons, hackathon_unique_id);

        // Check if the account is the owner of the hackathon
        assert!(hackathon.owner == signer::address_of(account), ERR_NOT_OWNER);

        hackathon.judges = judges;
    }

    public entry fun add_comment_for_hackathon(
        account: &signer,
        hackathon_unique_id: u64,
        comment: string::String
    ) acquires HackathonAggregator {
        let hackathon_aggr = borrow_global_mut<HackathonAggregator>(@my_addr);
        let hackathon_comment_set = table::borrow_mut(&mut hackathon_aggr.add_comment_event_set, hackathon_unique_id);

        event::emit_event<AddHackathonCommentEvent>(
            &mut hackathon_comment_set.add_hackathon_comment_events,
            AddHackathonCommentEvent {
                comment: comment,
                comment_owner: signer::address_of(account)
            }
        );
    }

    public entry fun add_comment_for_project(
        account: &signer,
        hackathon_unique_id: u64,
        project_unique_id: u64,
        comment: string::String
    ) acquires HackathonAggregator {
        let hackathon_aggr = borrow_global_mut<HackathonAggregator>(@my_addr);
        let hackathon_comment_set = table::borrow_mut(&mut hackathon_aggr.add_comment_event_set, hackathon_unique_id);

        event::emit_event<AddProjectCommentEvent>(
            &mut hackathon_comment_set.add_project_comment_events,
            AddProjectCommentEvent {
                project_unique_id: project_unique_id,
                comment: comment,
                comment_owner: signer::address_of(account)
            }
        );
    }

    // Recommend use arweave to store the comment, and record the judge address in the comment.
    // Only hackathon owner can add winner.
    public entry fun add_winners(
        account: &signer,
        hackathon_unique_id: u64,
        winners: vector<u64>,
        comments: vector<string::String>
    ) acquires HackathonAggregator {
        let hackathon_aggr = borrow_global_mut<HackathonAggregator>(@my_addr);
        let hackathon = table::borrow_mut(&mut hackathon_aggr.hackathons, hackathon_unique_id);

        // Check if the account is the owner of the hackathon
        assert!(hackathon.owner == signer::address_of(account), ERR_NOT_OWNER);

        hackathon.winners = winners;
        hackathon.comments = comments;
    }
    //<:!:entry fun


}
