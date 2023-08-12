return {
    deps: {
        allrepos: 'models',
        List: 'list'
    },
    create(deps, params){
        deps.allrepos.retrieveRepositories()
        this.super.create.call(this, deps, params)
    }
}