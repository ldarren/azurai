return {
    deps:{
        tpl: 'file',
        agents: 'models'
    },
    create(deps, params){
        this.el.innerHTML = deps.tpl(deps.agents.get(params.selected))
    }
}