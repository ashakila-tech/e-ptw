def paginate(q, page=1, page_size=20):
    t=q.count();items=q.offset((page-1)*page_size).limit(page_size).all();
    return {'total':t,'page':page,'page_size':page_size,'items':items}
