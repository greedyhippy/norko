# Norko Project - Context Engineering Setup

## 📋 **Context Management System**

### **Document Hierarchy**
```
norko/
├── 📄 PLANNING.md          # Architecture, goals, tech stack
├── 📄 TASK.md              # Current tasks, progress, backlog
├── 📄 CONTEXT.md           # This file - context engineering setup
├── 📄 claude.md            # AI assistant behavior directives
├── 📄 DECISIONS.md         # Architecture decisions and rationale
├── 📄 API.md               # API documentation and schemas
└── 📄 TESTING.md           # Testing strategy and coverage
```

### **Context Engineering Principles**

#### **Session Initialization Protocol**
1. **Always start by reading**: `PLANNING.md` → `TASK.md` → `CONTEXT.md`
2. **Check current state**: Review active tasks and recent commits
3. **Understand dependencies**: Check file relationships and data flow
4. **Verify environment**: Ensure all services are running and connected

#### **Task Execution Protocol**
1. **Before starting any task**: Update `TASK.md` with current objective
2. **During development**: Document decisions in `DECISIONS.md`
3. **After completion**: Mark task complete and update documentation
4. **Code changes**: Include JSDoc comments and update API documentation

#### **Quality Gates**
- ✅ All TypeScript types properly defined
- ✅ Tests written for new functionality  
- ✅ Documentation updated for changes
- ✅ No breaking changes without migration plan

### **File Organization Standards**

#### **Component Structure**
```typescript
/**
 * Component: [ComponentName]
 * Purpose: [Brief description]
 * Dependencies: [List key dependencies]
 * Last Updated: [Date]
 */
export default function ComponentName(props: ComponentProps) {
  // Implementation
}
```

#### **API Endpoint Documentation**
```typescript
/**
 * Endpoint: [HTTP Method] [Path]
 * Purpose: [What this endpoint does]
 * Input: [Expected input format]
 * Output: [Response format]
 * Errors: [Possible error conditions]
 */
```

### **Development Workflow**

#### **Feature Development Cycle**
1. **Planning**: Add task to `TASK.md` with requirements
2. **Design**: Document approach in `DECISIONS.md`
3. **Implementation**: Follow coding standards from `claude.md`
4. **Testing**: Write tests following `TESTING.md` guidelines
5. **Documentation**: Update relevant `.md` files
6. **Review**: Check against quality gates
7. **Completion**: Mark task done and commit changes

#### **Context Preservation**
- **Git commits**: Use conventional commit format
- **Branch naming**: `feature/task-description` or `fix/issue-description`
- **PR descriptions**: Link to relevant tasks and decisions
- **Code comments**: Explain business logic, not just syntax

## 🔄 **Current Context State**

### **Active Services**
- Remix dev server: `localhost:3018` ✅
- Railway GraphQL API: Connected ✅ 
- Crystallize tenant: Connected but empty ⚠️

### **Environment Status**
- Node.js/TypeScript: Ready ✅
- Git repository: Configured ✅
- Dependencies: Installed ✅
- Environment variables: Set ✅

### **Next Context Engineering Steps**
1. Create remaining documentation files
2. Implement structured logging system
3. Set up development guidelines
4. Create testing framework structure
5. Define API schema documentation
