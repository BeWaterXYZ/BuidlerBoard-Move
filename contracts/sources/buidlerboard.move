module my_addr::buidlerboard {
    use std::error;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    

    #[test_only]
    use std::debug;

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

    // :!:>view
    #[view]
    public fun get_hackathons_max_id(owner: address): u64 acquires HackathonAggregator {
        borrow_global<HackathonAggregator>(owner).max_id
    }

    #[view]
    public fun get_hackathons(owner: address): vector<Hackathon> acquires HackathonAggregator {
        borrow_global<HackathonAggregator>(owner).hackathons
    }

    #[view]
    public fun get_hackathon(owner: address, unique_id: u64): Hackathon acquires HackathonAggregator {
        borrow_global<HackathonAggregator>(owner).hackathons[unique_id]
    }

    #[view]
    public fun get_projects_max_id(owner: address): u64 acquires ProjectAggregator {
        borrow_global<ProjectAggregator>(owner).max_id
    }

    #[view]
    public fun get_projects(owner: address): vector<Project> acquires ProjectAggregator {
        borrow_global<ProjectAggregator>(owner).projects
    }

    #[view]
    public fun get_project(owner: address, unique_id: u64): Project acquires ProjectAggregator {
        borrow_global<ProjectAggregator>(owner).projects[unique_id]
    }


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
        github_url: string::String, 
        demo_url: string::String, 
        deck_url: string::String, 
        intro_video_url: string::String) acquires ProjectAggregator {
        let project_aggr = borrow_global_mut<ProjectAggregator>(@my_addr);
        project_aggr.max_id = project_aggr.max_id + 1;
        project_aggr.projects.push_back(Project {
            unique_id: project_aggr.max_id,
            name: name,
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
}
